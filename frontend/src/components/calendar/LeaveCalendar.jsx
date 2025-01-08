import React, { useState, useEffect } from 'react'; // Import necessary React hooks
import FullCalendar from '@fullcalendar/react'; // Import the FullCalendar component
import dayGridPlugin from '@fullcalendar/daygrid'; // Import the dayGrid plugin to display calendar in a grid layout
import interactionPlugin from '@fullcalendar/interaction'; // Import interaction plugin to enable event interaction (like selecting dates)

export default function LeaveCalendar({ onDateSelect, events = [] }) {
  // State to hold the list of current events
  const [currentEvents, setCurrentEvents] = useState(events);

  // Kenyan public holidays for 2024 (static data)
  const kenyanPublicHolidays = [
    { title: "New Year's Day", start: '2024-01-01', backgroundColor: '#93c5fd', textColor: '#1e3a8a' },
    { title: "Good Friday", start: '2024-03-29', backgroundColor: '#93c5fd', textColor: '#1e3a8a' },
    { title: "Easter Monday", start: '2024-04-01', backgroundColor: '#93c5fd', textColor: '#1e3a8a' },
    { title: "Labour Day", start: '2024-05-01', backgroundColor: '#93c5fd', textColor: '#1e3a8a' },
    { title: "Madaraka Day", start: '2024-06-01', backgroundColor: '#93c5fd', textColor: '#1e3a8a' },
    { title: "Eid al-Fitr", start: '2024-04-10', backgroundColor: '#93c5fd', textColor: '#1e3a8a' },
    { title: "Huduma Day", start: '2024-10-10', backgroundColor: '#93c5fd', textColor: '#1e3a8a' },
    { title: "Mashujaa Day", start: '2024-10-20', backgroundColor: '#93c5fd', textColor: '#1e3a8a' },
    { title: "Jamhuri Day", start: '2024-12-12', backgroundColor: '#93c5fd', textColor: '#1e3a8a' },
    { title: "Christmas Day", start: '2024-12-25', backgroundColor: '#93c5fd', textColor: '#1e3a8a' },
    { title: "Boxing Day", start: '2024-12-26', backgroundColor: '#93c5fd', textColor: '#1e3a8a' }
  ];

  // Custom holidays or local events (static data)
  const customHolidays = [
    { title: 'Company Anniversary', start: '2024-07-15', backgroundColor: '#fcd34d', textColor: '#000000' },
    { title: 'Team Building Day', start: '2024-08-20', backgroundColor: '#fcd34d', textColor: '#000000' }
  ];

  // Combine all events (Kenyan public holidays + custom holidays) when the component is mounted
  useEffect(() => {
    setCurrentEvents([...events, ...kenyanPublicHolidays, ...customHolidays]);
  }, [events]); // Dependency array ensures that this effect runs whenever the `events` prop changes

  // Handle date selection when a user selects a date range in the calendar
  const handleDateSelect = (selectInfo) => {
    // Trigger the `onDateSelect` callback passed from the parent component
    // Send the start and end date as arguments
    onDateSelect?.({
      start: selectInfo.startStr,
      end: selectInfo.endStr
    });
  };

  return (
    <div className="bg-white p-4 md:p-6 rounded-lg shadow-lg">
      {/* FullCalendar component which renders the calendar */}
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]} // Add the necessary plugins for displaying the calendar and enabling interactions
        initialView="dayGridMonth" // Set the initial view to a month grid
        selectable={true} // Enable selecting a date range on the calendar
        select={handleDateSelect} // Bind the date selection handler
        events={currentEvents} // Set the events to be displayed (combined holidays and events)
        height="auto" // Automatically adjust the height of the calendar
        headerToolbar={{
          left: 'prev,next today', // Navigation buttons for previous, next, and today
          center: 'title', // Display the title of the current month in the center
          right: 'dayGridMonth' // Option to switch to the month view
        }}
        // Custom event rendering (this will control how each event looks in the calendar)
        eventContent={(eventInfo) => (
          <div
            style={{
              backgroundColor: eventInfo.event.backgroundColor, // Set the background color of the event
              color: eventInfo.event.textColor, // Set the text color for the event
              borderRadius: '4px', // Rounded corners for the event
              padding: '4px', // Padding for better spacing
              fontSize: '0.8em', // Smaller font size for better readability
              maxWidth: '100%', // Ensure that the event text doesn't overflow
              overflow: 'hidden', // Hide any overflow
              textOverflow: 'ellipsis', // Show "..." for long titles
              whiteSpace: 'nowrap', // Prevent the text from wrapping
            }}
            className="hover:bg-opacity-80 transition duration-200" // Hover effect for better user interaction
          >
            {eventInfo.event.title} {/* Display the event's title */}
          </div>
        )}
        dayMaxEvents={true} // Ensure that if there are too many events on one day, a "+ more" link will appear
        eventBackgroundColor="#60a5fa" // Default background color for non-holiday events
        eventTextColor="#ffffff"       // Default text color for non-holiday events
      />
    </div>
  );
}
