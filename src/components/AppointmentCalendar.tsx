import React, { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format, addDays, isSameDay, parseISO, isAfter, isBefore, startOfDay } from 'date-fns';
import { Clock, Calendar as CalendarIcon } from 'lucide-react';

interface AppointmentCalendarProps {
  onDateTimeSelect: (date: string, time: string) => void;
  selectedDate?: string;
  selectedTime?: string;
  serviceType?: string;
  serviceDetails?: any;
  onBack?: () => void;
}

export const AppointmentCalendar: React.FC<AppointmentCalendarProps> = ({
  onDateTimeSelect,
  selectedDate,
  selectedTime,
  serviceType,
  serviceDetails,
  onBack,
}) => {
  const [selected, setSelected] = useState<Date | undefined>(
    selectedDate ? parseISO(selectedDate) : undefined
  );
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>(selectedTime || '');
  const [bookedSlots, setBookedSlots] = useState<{[key: string]: string[]}>({});
  const [unavailableSchedules, setUnavailableSchedules] = useState<any[]>([]);

  // Helper function to format time to AM/PM
  const formatTimeToAMPM = (time24: string) => {
    if (time24.includes('-')) {
      // Handle time ranges like "08:00-12:00"
      const [start, end] = time24.split('-');
      return `${formatTimeToAMPM(start)}-${formatTimeToAMPM(end)}`;
    }
    
    const [hours, minutes] = time24.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: true 
    });
  };

  // Get time slots based on service type
  const getTimeSlots = () => {
    if (serviceType === 'target-range') {
      // Target Range: 30-minute intervals
      return [
        '8:00 AM', '8:30 AM', '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', // Morning
        '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM', '5:00 PM'  // Afternoon
      ];
    } else if (serviceType === 'half-day') {
      // Half Day Rental: Only morning 8AM-12PM or afternoon 1PM-5PM
      if (serviceDetails?.schedule === 'morning') {
        return ['8:00 AM-12:00 PM'];
      } else if (serviceDetails?.schedule === 'afternoon') {
        return ['1:00 PM-5:00 PM'];
      }
      return ['8:00 AM-12:00 PM', '1:00 PM-5:00 PM'];
    } else {
      // Regular Rates and Group Packages: 2 hour slots
      return [
        '8:00 AM-10:00 AM', '10:00 AM-12:00 PM', // Morning slots
        '1:00 PM-3:00 PM', '3:00 PM-5:00 PM'  // Afternoon slots
      ];
    }
  };

  const timeSlots = getTimeSlots();

  useEffect(() => {
    // Load booked appointments and unavailable schedules
    loadBookedAppointments();
    loadUnavailableSchedules();
  }, []);

  const loadBookedAppointments = () => {
    try {
      const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
      const bookedByDate: {[key: string]: string[]} = {};
      
      appointments.forEach((apt: any) => {
        if (apt.status !== "Didn't show up") {
          const dateKey = apt.appointment_date;
          if (!bookedByDate[dateKey]) {
            bookedByDate[dateKey] = [];
          }
          bookedByDate[dateKey].push(apt.appointment_time);
        }
      });
      
      setBookedSlots(bookedByDate);
    } catch (error) {
      console.error('Error loading booked appointments:', error);
    }
  };

  const loadUnavailableSchedules = () => {
    try {
      const schedules = JSON.parse(localStorage.getItem('unavailable_schedules') || '[]');
      setUnavailableSchedules(schedules);
    } catch (error) {
      console.error('Error loading unavailable schedules:', error);
    }
  };

  const isDateDisabled = (date: Date) => {
    const today = startOfDay(new Date());
    const maxDate = addDays(today, 60); // 2 months in advance
    
    // Disable past dates and dates more than 2 months ahead
    if (isBefore(date, today) || isAfter(date, maxDate)) {
      return true;
    }

    // Disable Sundays (0 = Sunday)
    if (date.getDay() === 0) {
      return true;
    }

    // Check if entire day is unavailable
    const dateStr = format(date, 'yyyy-MM-dd');
    return unavailableSchedules.some(schedule => 
      schedule.unavailable_date === dateStr && schedule.is_full_day
    );
  };

  const isTimeSlotAvailable = (time: string) => {
    if (!selected) return false;
    
    const selectedDateStr = format(selected, 'yyyy-MM-dd');
    
    // Check if time is already booked
    const bookedTimes = bookedSlots[selectedDateStr] || [];
    if (bookedTimes.includes(time)) {
      return false;
    }

    // Check if time is in unavailable schedules
    const isUnavailable = unavailableSchedules.some(schedule => 
      schedule.unavailable_date === selectedDateStr && 
      !schedule.is_full_day && 
      schedule.unavailable_time === time
    );

    return !isUnavailable;
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelected(date);
    setSelectedTimeSlot(''); // Reset time selection when date changes
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTimeSlot(time);
  };

  const handleContinue = () => {
    if (selected && selectedTimeSlot) {
      const dateStr = format(selected, 'yyyy-MM-dd');
      onDateTimeSelect(dateStr, selectedTimeSlot);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const getAvailableTimesCount = () => {
    if (!selected) return 0;
    return timeSlots.filter(time => isTimeSlotAvailable(time)).length;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calendar */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <CalendarIcon className="w-5 h-5 mr-2 text-primary" />
              <h3 className="text-lg font-semibold">Select Date</h3>
            </div>
            <Calendar
              mode="single"
              selected={selected}
              onSelect={handleDateSelect}
              disabled={isDateDisabled}
              className="rounded-md border"
            />
            <div className="mt-4 space-y-2 text-sm text-muted-foreground">
              <p>• Appointments available Monday - Saturday</p>
              <p>• Book up to 2 months in advance</p>
              {serviceType === 'target-range' ? (
                <>
                  <p>• Morning: 8:00 AM - 12:00 PM (30-min slots)</p>
                  <p>• Afternoon: 1:00 PM - 5:00 PM (30-min slots)</p>
                </>
              ) : serviceType === 'half-day' ? (
                <>
                  <p>• Morning: 8:00 AM - 12:00 PM</p>
                  <p>• Afternoon: 1:00 PM - 5:00 PM</p>
                </>
              ) : (
                <>
                  <p>• Morning: 8:00 AM - 10:00 AM, 10:00 AM - 12:00 PM</p>
                  <p>• Afternoon: 1:00 PM - 3:00 PM, 3:00 PM - 5:00 PM</p>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Time Slots */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Clock className="w-5 h-5 mr-2 text-primary" />
                <h3 className="text-lg font-semibold">Select Time</h3>
              </div>
              {selected && (
                <Badge variant="outline">
                  {getAvailableTimesCount()} available
                </Badge>
              )}
            </div>
            
            {!selected ? (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Please select a date first</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-sm font-medium">
                  {format(selected, 'EEEE, MMMM d, yyyy')}
                </div>
                
                {getAvailableTimesCount() === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No available times for this date</p>
                    <p className="text-xs">Please select another date</p>
                  </div>
                ) : (
                  <>
                    <div className="text-sm text-muted-foreground mb-2">Morning</div>
                     <div className={`grid gap-2 mb-4 ${serviceType === 'target-range' ? 'grid-cols-3' : 'grid-cols-1'}`}>
                       {timeSlots.filter(time => 
                         serviceType === 'target-range' 
                           ? time.startsWith('8:') || time.startsWith('9:') || time.startsWith('10:') || time.startsWith('11:') || time.startsWith('12:')
                           : time.startsWith('8:') || time.startsWith('10:')
                       ).map((time) => (
                        <Button
                          key={time}
                          variant={selectedTimeSlot === time ? "default" : "outline"}
                          size="sm"
                          disabled={!isTimeSlotAvailable(time)}
                          onClick={() => handleTimeSelect(time)}
                          className={`${serviceType === 'target-range' ? 'h-8 text-xs' : 'h-10 text-sm'}`}
                        >
                          {time}
                        </Button>
                      ))}
                    </div>
                    
                    <div className="text-sm text-muted-foreground mb-2">Afternoon</div>
                     <div className={`grid gap-2 ${serviceType === 'target-range' ? 'grid-cols-3' : 'grid-cols-1'}`}>
                       {timeSlots.filter(time => 
                         serviceType === 'target-range'
                           ? time.startsWith('1:') || time.startsWith('2:') || time.startsWith('3:') || time.startsWith('4:') || time.startsWith('5:')
                           : time.startsWith('1:') || time.startsWith('3:')
                       ).map((time) => (
                        <Button
                          key={time}
                          variant={selectedTimeSlot === time ? "default" : "outline"}
                          size="sm"
                          disabled={!isTimeSlotAvailable(time)}
                          onClick={() => handleTimeSelect(time)}
                          className={`${serviceType === 'target-range' ? 'h-8 text-xs' : 'h-10 text-sm'}`}
                        >
                          {time}
                        </Button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center max-w-md mx-auto">
        {onBack && (
          <Button
            variant="outline"
            onClick={onBack}
            size="lg"
            className="w-48"
          >
            Back to Half Day Rental
          </Button>
        )}
        <Button
          onClick={handleContinue}
          disabled={!selected || !selectedTimeSlot}
          size="lg"
          className="w-48"
        >
          Continue to Patient Info
        </Button>
      </div>
    </div>
  );
};