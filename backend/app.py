from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_restful import Resource, Api
from passlib.hash import sha256_crypt
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    get_jwt_identity,
    jwt_required,
    JWTManager,
    get_jwt
)
from flask_cors import CORS
import datetime

# Initialize Flask app and extensions
app = Flask(__name__, template_folder='templates')

# PostgreSQL database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:kizito057@localhost:5432/manage_db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = 'r^3FjA!2M$kD@9#1XoP&8zLt+W5N(4YeG)HvJq%B7k^6_2mCs!Rx'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = datetime.timedelta(minutes=240)
app.config['JWT_REFRESH_TOKEN_EXPIRES'] = datetime.timedelta(days=1)  # Refresh token


# Initialize Flask extensions
db = SQLAlchemy(app)
api = Api(app)
jwt = JWTManager(app)
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:5173"],
        "supports_credentials": True,
        "methods": ["GET", "POST", "OPTIONS", "PUT", "DELETE"]
    }
}) # Enable Cross-Origin Resource Sharing

# Database Models
class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    role = db.Column(db.String(20), nullable=False, default="Employee")  # Role: 'Admin' or 'Employee'
    is_approved = db.Column(db.Boolean, default=False)  # Pending approval by Admin

class RevokedToken(db.Model):
    __tablename__ = 'revoked_tokens'
    id = db.Column(db.Integer, primary_key=True)
    jti = db.Column(db.String(120), nullable=False)

class LeaveType(db.Model):
    __tablename__ = 'leave_types'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    description = db.Column(db.String(200))

class LeaveRequest(db.Model):
    __tablename__ = 'leave_requests'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    leave_type_id = db.Column(db.Integer, db.ForeignKey('leave_types.id'), nullable=False)
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date, nullable=False)
    status = db.Column(db.String(20), default="Pending")  # Status: Pending, Approved, Rejected
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)

# Create tables if they do not exist
with app.app_context():
    db.create_all()

# Helper function to enforce role-based access
def role_required(role):
    def decorator(func):
        @jwt_required()
        def wrapper(*args, **kwargs):
            current_user_email = get_jwt_identity()
            user = User.query.filter_by(email=current_user_email).first()
            if not user:
                return {"msg": "User not found"}, 404
            if user.role != role or not user.is_approved:
                return {"msg": "Access denied: Unauthorized role or not approved"}, 403
            return func(*args, **kwargs)
        return wrapper
    return decorator

# JWT Token Revocation Check
@jwt.token_in_blocklist_loader
def check_if_token_is_revoked(jwt_header, jwt_payload):
    jti = jwt_payload["jti"]
    token = RevokedToken.query.filter_by(jti=jti).first()
    return token is not None

# Login Route
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    # Retrieve user from database
    user = User.query.filter_by(email=email).first()

    # Validate user credentials
    if not user or not sha256_crypt.verify(password, user.password):
        return jsonify({"msg": "Invalid credentials"}), 401

    # Check if user is approved
    if not user.is_approved:
        return jsonify({"msg": "Account not approved by admin"}), 403

    # Create access token and include role in the response
    access_token = create_access_token(identity=user.email)
    return jsonify({
        "access_token": access_token,
        "role": user.role  # Include user's role in the response
    }), 200

# API Resources

class Register(Resource):
    def post(self):
        data = request.get_json()

        # Validation
        email = data.get("email")
        password = data.get("password")
        role = data.get("role", "Employee")

        if not email or not password:
            return {"msg": "Email and password are required"}, 400
        if role not in ["Admin", "Employee"]:
            return {"msg": "Invalid role specified"}, 400

        # Check if user already exists
        if User.query.filter_by(email=email).first():
            return {"msg": "User already exists"}, 400

        hashed_password = sha256_crypt.encrypt(password)
        new_user = User(email=email, password=hashed_password, role=role, is_approved=False)
        db.session.add(new_user)
        db.session.commit()
        return {"msg": "User registered successfully, pending admin approval"}, 201

api.add_resource(Register, '/api/register')

class ApproveUser(Resource):
    @role_required("Admin")
    def post(self):
        data = request.get_json()
        user_id = data.get("user_id")
        action = data.get("action")

        if not user_id or action not in ["approve", "reject"]:
            return {"msg": "User ID and valid action ('approve' or 'reject') are required"}, 400

        user = User.query.get(user_id)
        if not user:
            return {"msg": "User not found"}, 404

        if action == "approve":
            user.is_approved = True
        elif action == "reject":
            db.session.delete(user)
        db.session.commit()
        return {"msg": f"User {action}d successfully"}, 200

api.add_resource(ApproveUser, '/api/admin/approve-user')

class LeaveTypeManagement(Resource):
    # Existing POST method for creating a new leave type (Admin only)
    @role_required("Admin")
    def post(self):
        data = request.get_json()
        name = data.get("name")
        description = data.get("description", "")

        if not name:
            return {"msg": "Leave type name is required"}, 400

        leave_type = LeaveType(name=name, description=description)
        db.session.add(leave_type)
        db.session.commit()
        return {"msg": f"Leave type '{name}' created successfully"}, 201

    # New PUT method for updating an existing leave type
    @role_required("Admin")
    def put(self, leave_type_id):
        data = request.get_json()
        name = data.get("name")
        description = data.get("description", "")

        if not name:
            return {"msg": "Leave type name is required"}, 400

        leave_type = LeaveType.query.get(leave_type_id)
        if not leave_type:
            return {"msg": "Leave type not found"}, 404

        leave_type.name = name
        leave_type.description = description
        db.session.commit()
        return {"msg": f"Leave type '{name}' updated successfully"}, 200

    # New DELETE method for removing a leave type
    @role_required("Admin")
    def delete(self, leave_type_id):
        leave_type = LeaveType.query.get(leave_type_id)
        if not leave_type:
            return {"msg": "Leave type not found"}, 404

        # Check if there are any leave requests associated with this type
        existing_requests = LeaveRequest.query.filter_by(leave_type_id=leave_type_id).first()
        if existing_requests:
            return {"msg": "Cannot delete leave type with existing leave requests"}, 400

        db.session.delete(leave_type)
        db.session.commit()
        return {"msg": "Leave type deleted successfully"}, 200
    

    # Existing GET method for retrieving leave types
    def get(self):
        leave_types = LeaveType.query.all()
        leave_types_data = [
            {"id": leave_type.id, "name": leave_type.name, "description": leave_type.description}
            for leave_type in leave_types
        ]
        return {"leave_types": leave_types_data}, 200

# Update API resource registration to support new routes
api.add_resource(LeaveTypeManagement, 
    '/api/leave-types', 
    '/api/admin/leave-types', 
    '/api/admin/leave-types/<int:leave_type_id>'
)

class ApplyLeave(Resource):
    @role_required("Employee")
    def post(self):
        data = request.get_json()
        leave_type_id = data.get("leave_type_id")
        start_date = data.get("start_date")
        end_date = data.get("end_date")

        if not (leave_type_id and start_date and end_date):
            return {"msg": "Leave type, start date, and end date are required"}, 400

        user_email = get_jwt_identity()
        user = User.query.filter_by(email=user_email).first()

        leave_request = LeaveRequest(
            user_id=user.id,
            leave_type_id=leave_type_id,
            start_date=start_date,
            end_date=end_date,
        )
        db.session.add(leave_request)
        db.session.commit()
        return {"msg": "Leave request submitted successfully"}, 201

api.add_resource(ApplyLeave, '/api/employee/apply-leave')

class ReviewLeave(Resource):
    @role_required("Admin")
    def post(self):
        data = request.get_json()
        leave_request_id = data.get("leave_request_id")
        action = data.get("action")

        if not leave_request_id or action not in ["approve", "reject"]:
            return {"msg": "Leave request ID and valid action ('approve' or 'reject') are required"}, 400

        leave_request = LeaveRequest.query.get(leave_request_id)
        if not leave_request:
            return {"msg": "Leave request not found"}, 404

        leave_request.status = "Approved" if action == "approve" else "Rejected"
        db.session.commit()
        return {"msg": f"Leave request {action}d successfully"}, 200

api.add_resource(ReviewLeave, '/api/admin/review-leave')

class AdminLeaveRequests(Resource):
    @role_required("Admin")
    def get(self):
        leave_requests = LeaveRequest.query.all()
        result = [
            {
                "id": request.id,
                "user_email": User.query.get(request.user_id).email,
                "leave_type": LeaveType.query.get(request.leave_type_id).name,
                "start_date": request.start_date.isoformat(),
                "end_date": request.end_date.isoformat(),
                "status": request.status,
                "created_at": request.created_at.isoformat()
            }
            for request in leave_requests
        ]
        return result, 200

api.add_resource(AdminLeaveRequests, '/api/admin/leave-requests')

class LeaveStatistics(Resource):
    @role_required("Admin")
    def get(self):
        total_requests = LeaveRequest.query.count()
        pending_requests = LeaveRequest.query.filter_by(status="Pending").count()
        approved_requests = LeaveRequest.query.filter_by(status="Approved").count()
        rejected_requests = LeaveRequest.query.filter_by(status="Rejected").count()
        leave_types = LeaveType.query.all()
        leave_type_stats = [
            {
                "name": leave_type.name,
                "total_requests": LeaveRequest.query.filter_by(leave_type_id=leave_type.id).count()
            }
            for leave_type in leave_types
        ]
        return {
            "total_requests": total_requests,
            "pending_requests": pending_requests,
            "approved_requests": approved_requests,
            "rejected_requests": rejected_requests,
            "leave_type_stats": leave_type_stats
        }, 200

api.add_resource(LeaveStatistics, '/api/admin/leave-stats')

# Enhanced Leave History Endpoint with More Robust Error Handling
class LeaveHistory(Resource):
    @jwt_required()  # Ensure JWT token is present
    def get(self):
        try:
            # Retrieve the current user's email from the JWT token
            current_user_email = get_jwt_identity()
            
            # Verify user exists and is approved
            user = User.query.filter_by(email=current_user_email).first()
            
            if not user:
                return {"error": "User not found"}, 404
            
            if not user.is_approved:
                return {"error": "User account is not approved"}, 403

            # Retrieve leave requests with detailed information
            leave_requests = LeaveRequest.query.filter_by(user_id=user.id).all()
            
            result = [
                {
                    "id": request.id,  # Add unique identifier
                    "leave_type": LeaveType.query.get(request.leave_type_id).name,
                    "start_date": request.start_date.isoformat(),  # Consistent date formatting
                    "end_date": request.end_date.isoformat(),
                    "status": request.status,
                    "created_at": request.created_at.isoformat(),
                    "duration": (request.end_date - request.start_date).days + 1  # Calculate leave duration
                }
                for request in leave_requests
            ]

            return {"leave_history": result}, 200
        
        except Exception as e:
            # Comprehensive error logging
            app.logger.error(f"Leave history retrieval error: {str(e)}")
            return {"error": "Internal server error", "details": str(e)}, 500

api.add_resource(LeaveHistory, '/api/employee/leave-history')

class PendingUsers(Resource):
    @role_required("Admin")
    def get(self):
        pending_users = User.query.filter_by(is_approved=False).all()
        result = [
            {
                "id": user.id,
                "email": user.email,
                "role": user.role
            }
            for user in pending_users
        ]
        return {"pending_users": result}, 200

api.add_resource(PendingUsers, '/api/admin/pending-users')

class Logout(Resource):
    @jwt_required()
    def post(self):
        jti = get_jwt()["jti"]
        revoked_token = RevokedToken(jti=jti)
        db.session.add(revoked_token)
        db.session.commit()
        return {"msg": "Token revoked"}, 200

api.add_resource(Logout, '/api/logout')

# Run the app
if __name__ == "__main__":
    app.run(debug=True)