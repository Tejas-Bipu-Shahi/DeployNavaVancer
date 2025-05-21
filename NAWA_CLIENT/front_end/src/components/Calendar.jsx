import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import NoticeMap from './notices/NoticeMap';
import { useNavigate } from 'react-router-dom';
import { 
  FaChevronLeft, 
  FaChevronRight, 
  FaSpinner, 
  FaRegSadCry, 
  FaClock,
  FaRegCalendarAlt, 
  FaRegBell,
  FaSearch,
  FaInfoCircle,
  FaCheckCircle,
  FaMapMarkerAlt,
  FaGraduationCap,
  FaBook,
  FaUserFriends,
  FaCog,
  FaStar,
  FaArrowRight
} from 'react-icons/fa';

const Calendar = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const navigate = useNavigate();

  const [selectedDate, setSelectedDate] = useState(today);
  const [allNoticesForSelectedDate, setAllNoticesForSelectedDate] = useState([]);
  const [loadingNotices, setLoadingNotices] = useState(true);
  const [calendarMatrix, setCalendarMatrix] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [noticesForMonth, setNoticesForMonth] = useState({}); 
  const [currentNoticePage, setCurrentNoticePage] = useState(1);
  const [hoverDay, setHoverDay] = useState(null);
  const noticesPerPage = 5;

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const parseDateString = useCallback((dateStr) => {
    if (!dateStr) return null;
    if (typeof dateStr === 'string' && dateStr.match(/^\d{4}-\d{2}-\d{2}/)) {
      const parts = dateStr.substring(0, 10).split('-').map(Number);
      const d = new Date(parts[0], parts[1] - 1, parts[2]);
      d.setHours(0,0,0,0);
      return d;
    }
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return null;
    d.setHours(0,0,0,0); 
    return d;
  }, []);

  const generateCalendar = useCallback((year, month) => {
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    let matrix = [];
    let day = 1;
    for (let i = 0; i < 6; i++) {
      let week = [];
      for (let j = 0; j < 7; j++) {
        if (i === 0 && j < firstDayOfMonth) {
          week.push(null);
        } else if (day > daysInMonth) {
          week.push(null);
        } else {
          week.push(day);
          day++;
        }
      }
      matrix.push(week);
      if (day > daysInMonth && matrix[matrix.length - 1].every(d => d === null)) {
         matrix.pop(); 
      }
      if (day > daysInMonth) break;
    }
    setCalendarMatrix(matrix);
  }, []);
  
  const fetchNoticesForMonthIndicators = useCallback(async (year, month) => {
    try {
      const response = await axios.get("http://localhost:8000/get/notices");
      const monthNoticesMap = {};
      (response.data || []).forEach(notice => {
        const noticeDate = parseDateString(notice.date || notice.createdAt);
        if (noticeDate && noticeDate.getFullYear() === year && noticeDate.getMonth() === month) {
          const day = noticeDate.getDate();
          if (!monthNoticesMap[day]) {
            monthNoticesMap[day] = [];
          }
          monthNoticesMap[day].push({
            title: notice.title || notice.noticetitle || 'School Notice',
            id: notice._id
          });
        }
      });
      setNoticesForMonth(monthNoticesMap);
    } catch (error) {
      console.error("Error fetching notices for month indicators:", error);
      setNoticesForMonth({});
    }
  }, [parseDateString]);

  const fetchNoticesForSelectedDate = useCallback(async (dateObj) => {
    if (!dateObj) {
      setAllNoticesForSelectedDate([]);
      setLoadingNotices(false);
      setCurrentNoticePage(1);
      return;
    }
    setLoadingNotices(true);
    setCurrentNoticePage(1); // Reset to first page for new date
    try {
      const response = await axios.get("http://localhost:8000/get/notices");
      const selectedDateString = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
      const filtered = (response.data || []).filter(notice => {
        const noticeDate = parseDateString(notice.date || notice.createdAt);
        if (!noticeDate) return false;
        const noticeDateString = `${noticeDate.getFullYear()}-${String(noticeDate.getMonth() + 1).padStart(2, '0')}-${String(noticeDate.getDate()).padStart(2, '0')}`;
        return noticeDateString === selectedDateString;
      });
      setAllNoticesForSelectedDate(filtered.sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt)));
    } catch (error) {
      console.error("Error fetching notices for date:", error);
      setAllNoticesForSelectedDate([]);
    }
    setLoadingNotices(false);
  }, [parseDateString]);

  useEffect(() => {
    generateCalendar(currentYear, currentMonth);
    fetchNoticesForMonthIndicators(currentYear, currentMonth);
  }, [currentMonth, currentYear, generateCalendar, fetchNoticesForMonthIndicators]);

  useEffect(() => {
    if (selectedDate) {
      fetchNoticesForSelectedDate(selectedDate);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]); // Re-fetch when selectedDate changes
  
  const handleDateClick = (day) => {
    if (!day) return;
    const date = new Date(currentYear, currentMonth, day);
    date.setHours(0,0,0,0);
    setSelectedDate(date); 
  };

  const goToToday = () => {
    const localToday = new Date(); 
    localToday.setHours(0,0,0,0);
    setCurrentMonth(localToday.getMonth());
    setCurrentYear(localToday.getFullYear());
    setSelectedDate(localToday);
  };

  const changeMonth = (offset) => {
    const newDate = new Date(currentYear, currentMonth + offset, 1);
    setCurrentMonth(newDate.getMonth());
    setCurrentYear(newDate.getFullYear());
    setSelectedDate(null); // Clear selected date when changing month
    setAllNoticesForSelectedDate([]); // Clear notices
  };

  const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  // Pagination logic
  const indexOfLastNotice = currentNoticePage * noticesPerPage;
  const indexOfFirstNotice = indexOfLastNotice - noticesPerPage;
  const currentNoticesToDisplay = allNoticesForSelectedDate.slice(indexOfFirstNotice, indexOfLastNotice);
  const totalNoticePages = Math.ceil(allNoticesForSelectedDate.length / noticesPerPage);

  const paginateNotices = (pageNumber) => setCurrentNoticePage(pageNumber);
  
  // Get time ago string
  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHr / 24);
    
    if (diffDays > 30) {
      return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? 's' : ''} ago`;
    }
    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    }
    if (diffHr > 0) {
      return `${diffHr} hour${diffHr > 1 ? 's' : ''} ago`;
    }
    if (diffMin > 0) {
      return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
    }
    return 'Just now';
  };

  // Format date for header
  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric'
    });
  };

  // Get icon for notice based on title/content - just a visual enhancement
  const getNoticeIcon = (notice) => {
    const title = (notice.title || '').toLowerCase();
    if (title.includes('exam') || title.includes('test')) return <FaBook />;
    if (title.includes('meeting') || title.includes('assembly')) return <FaUserFriends />;
    if (title.includes('event')) return <FaStar />;
    if (title.includes('class')) return <FaGraduationCap />;
    if (title.includes('location') || title.includes('place')) return <FaMapMarkerAlt />;
    if (title.includes('setting') || title.includes('update')) return <FaCog />;
    return <FaCheckCircle />;
  };

  const redirectToNotice = () => {
    // Navigate to the notice page
    navigate('/notice');
  };

  return (
    <div className="min-h-screen bg-[#f3f2ef] p-2 sm:p-4 md:p-6 flex flex-col items-center">
      {/* Header with Glass Effect */}
      <div className="w-full max-w-6xl mb-4 sm:mb-6">
        <div className="backdrop-blur-sm bg-white/90 rounded-xl shadow-lg p-4 flex flex-col sm:flex-row items-center justify-between">
          <div className="flex items-center mb-3 sm:mb-0">
            <div className="bg-gradient-to-r from-[#0a66c2] to-[#0077b5] text-white p-2 rounded-lg mr-3">
              <FaRegCalendarAlt className="text-xl sm:text-2xl" />
            </div>
            <h1 className="text-xl sm:text-2xl font-semibold text-[#191919]">
              Calendar
            </h1>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-4">
            <button 
              onClick={goToToday} 
              className="px-3 py-1.5 text-xs font-medium text-[#0a66c2] bg-white hover:bg-[#e8f3ff] border border-[#0a66c2] rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-[#0a66c2] focus:ring-opacity-50"
            >
              Today
            </button>
            
            <div className="flex items-center bg-white rounded-md border border-gray-300 shadow-sm">
              <button 
                onClick={() => changeMonth(-1)} 
                className="p-1.5 text-gray-500 hover:text-[#0a66c2] hover:bg-[#e8f3ff] rounded-l-md focus:outline-none"
              >
                <FaChevronLeft size={14} />
              </button>
              <span className="text-sm font-medium text-[#191919] px-2">
                {monthNames[currentMonth]} {currentYear}
              </span>
              <button 
                onClick={() => changeMonth(1)} 
                className="p-1.5 text-gray-500 hover:text-[#0a66c2] hover:bg-[#e8f3ff] rounded-r-md focus:outline-none"
              >
                <FaChevronRight size={14} />
              </button>
            </div>
            
            <div className="hidden sm:flex items-center bg-[#e8f3ff] text-[#0a66c2] rounded-full px-3 py-1 text-xs">
              <FaInfoCircle className="mr-1" size={12} />
              <span>{new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Calendar */}
        <div className="lg:col-span-3 bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
          <div className="grid grid-cols-7 border-b">
            {daysOfWeek.map((day, idx) => (
              <div 
                key={day} 
                className={`py-2 text-center text-xs font-medium ${idx === 0 || idx === 6 ? 'text-[#0a66c2]' : 'text-[#666666]'}`}
              >
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 h-[calc(65vh-120px)]">
            {calendarMatrix.flat().map((day, idx) => {
              if (!day) {
                return <div key={idx} className="border-r border-b border-gray-100"></div>;
              }
              
              const dateObj = new Date(currentYear, currentMonth, day);
              dateObj.setHours(0, 0, 0, 0);
              const isCurrentSelectedDate = selectedDate && dateObj.getTime() === selectedDate.getTime();
              const isTodayDate = dateObj.getTime() === today.getTime();
              const hasNoticesForDay = noticesForMonth[day] && noticesForMonth[day].length > 0;
              const dayOfWeek = dateObj.getDay();
              const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
              const isHovering = hoverDay === day;
              
              return (
                <div
                  key={`${currentYear}-${currentMonth}-${day}`}
                  onClick={() => handleDateClick(day)}
                  onMouseEnter={() => setHoverDay(day)}
                  onMouseLeave={() => setHoverDay(null)}
                  className={`
                    relative border-r border-b border-gray-100 min-h-[80px] transition-all duration-200 cursor-pointer
                    ${isCurrentSelectedDate ? 'bg-[#e8f3ff]' : dayOfWeek === 6 ? 'bg-[#fff5f5]' : 'hover:bg-gray-50'}
                    ${isHovering ? 'shadow-md transform scale-[1.02] z-10' : ''}
                  `}
                >
                  <div className={`
                    flex justify-center items-center w-7 h-7 mx-auto mt-1 text-sm font-medium rounded-full
                    ${isTodayDate ? 'bg-[#0a66c2] text-white' : 
                      isCurrentSelectedDate ? 'text-[#0a66c2] border-2 border-[#0a66c2]' : 
                      dayOfWeek === 6 ? 'text-red-600' : 'text-[#666666]'}
                  `}>
                    {day}
                  </div>
                  
                  {hasNoticesForDay && (
                    <div 
                      className={`mt-2 flex flex-col items-center ${
                        isHovering 
                          ? 'opacity-100 translate-y-0 scale-105 z-10' 
                          : 'opacity-85 translate-y-1 scale-100'
                      } transition-all duration-300 ease-in-out`}
                    >
                      {noticesForMonth[day].map((notice, idx) => (
                        <div 
                          key={notice.id || idx}
                          className={`w-4/5 py-1 px-1 text-[10px] rounded-md text-white bg-[#0a66c2] truncate text-center mb-1 ${
                            isHovering 
                              ? 'shadow-lg transform transition-transform duration-300 ease-out notice-glow' 
                              : 'shadow-sm'
                          } hover:bg-[#0077b5]`}
                          style={{
                            transform: isHovering ? `translateY(${-idx * 2}px) scale(1.03)` : 'translateY(0) scale(1)',
                            transitionDelay: `${idx * 50}ms`,
                            animation: isHovering ? `popUpNotice 0.3s ease-out ${idx * 50}ms forwards` : 'none'
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            redirectToNotice();
                          }}
                        >
                          <span>{notice.title}</span>
                        </div>
                      )).slice(0, 2)}
                      {noticesForMonth[day].length > 2 && (
                        <div 
                          className={`text-[9px] text-[#0a66c2] font-medium mt-1 ${
                            isHovering 
                              ? 'opacity-100 translate-y-0' 
                              : 'opacity-85 translate-y-1'
                          } transition-all duration-300 ease-in-out`}
                          style={{
                            transitionDelay: '150ms'
                          }}
                        >
                          +{noticesForMonth[day].length - 2} more
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Notices Panel */}
        <div className="bg-white rounded-xl shadow-lg p-0 min-h-[65vh] flex flex-col border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-[#0a66c2]/10 to-[#0077b5]/5 p-4 border-b border-blue-100">
            <h3 className="text-[#191919] font-medium flex items-center mb-2">
              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-[#0a66c2] to-[#0077b5] flex items-center justify-center text-white shadow-sm">
                <FaRegBell className="text-sm" />
              </div>
              <div className="ml-3">
                <span className="block">{selectedDate ? formatDate(selectedDate) : 'Select a date'}</span>
                {selectedDate && (
                  <div className="flex items-center text-xs text-[#666666] mt-0.5">
                    <FaClock className="mr-1" size={10} />
                    <span className="font-medium text-[#0a66c2]">{allNoticesForSelectedDate.length}</span>
                    <span className="ml-1">{allNoticesForSelectedDate.length !== 1 ? 'notices' : 'notice'}</span>
                  </div>
                )}
              </div>
            </h3>
          </div>
          
          {/* Notice Search - Redesigned */}
          {selectedDate && allNoticesForSelectedDate.length > 0 && (
            <div className="relative px-4 pt-4 pb-2">
              {/* Search bar removed */}
            </div>
          )}
          
          {/* Notices Content */}
          <div className="flex-grow overflow-auto custom-scrollbar px-4 py-2">
            {loadingNotices ? (
              <div className="flex flex-col items-center justify-center h-full">
                <div className="w-10 h-10 rounded-full border-t-2 border-b-2 border-[#0a66c2] animate-spin mb-2"></div>
                <p className="text-sm text-[#666666]">Loading notices...</p>
              </div>
            ) : selectedDate && currentNoticesToDisplay.length > 0 ? (
              <div className="space-y-2">
                {currentNoticesToDisplay.map((notice, idx) => {
                  const noticeTitle = notice.title || notice.noticetitle || 'School Notice';
                  const category = notice.noticecategory || 'General';
                  const bgColorClass = 
                    category.toLowerCase() === 'exam' ? 'bg-gradient-to-br from-green-50 to-blue-50 border-l-green-400' :
                    category.toLowerCase() === 'event' ? 'bg-gradient-to-br from-purple-50 to-pink-50 border-l-purple-400' :
                    category.toLowerCase() === 'holiday' ? 'bg-gradient-to-br from-red-50 to-orange-50 border-l-red-400' :
                    category.toLowerCase() === 'important' ? 'bg-gradient-to-br from-yellow-50 to-amber-50 border-l-yellow-400' :
                    'bg-gradient-to-br from-blue-50 to-indigo-50 border-l-blue-400';
                  
                  return (
                    <div 
                      key={notice._id || `notice-${idx}`} 
                      className={`relative overflow-hidden border-l-4 ${bgColorClass} rounded-r-xl p-3 transform transition-all duration-300 hover:translate-x-1 hover:shadow-md group`}
                    >
                      {/* Category badge */}
                      <div className="absolute top-0 right-0 transform translate-x-8 group-hover:translate-x-0 transition-transform duration-300">
                        <div className={`
                          px-3 py-0.5 rounded-bl-lg text-xs font-medium
                          ${category.toLowerCase() === 'exam' ? 'bg-green-500 text-white' :
                            category.toLowerCase() === 'event' ? 'bg-purple-500 text-white' :
                            category.toLowerCase() === 'holiday' ? 'bg-red-500 text-white' :
                            category.toLowerCase() === 'important' ? 'bg-yellow-500 text-black' :
                            'bg-blue-500 text-white'}
                        `}>
                          {category}
                        </div>
                      </div>
                      
                      {/* Notice content */}
                      <div className="flex items-start">
                        <div className="min-w-0 flex-1">
                          {/* Title with animated underline on hover */}
                          <h4 
                            onClick={() => redirectToNotice()}
                            className="relative font-medium text-sm text-gray-800 inline-block cursor-pointer group-hover:text-[#0a66c2] pr-12 pb-0.5"
                          >
                            <span>{noticeTitle}</span>
                            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#0a66c2] transition-all duration-300 group-hover:w-full"></span>
                          </h4>
                          
                          {/* Time and author info in a creative layout */}
                          <div className="flex items-center mt-2 opacity-80">
                            <div className="w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center">
                              <span className="animate-ping absolute h-1.5 w-1.5 rounded-full bg-[#0a66c2] opacity-75"></span>
                              <span className="relative rounded-full h-1 w-1 bg-[#0a66c2]"></span>
                            </div>
                            <div className="ml-2 flex items-center text-xs text-gray-500">
                              <span>{getTimeAgo(notice.date || notice.createdAt)}</span>
                              <span className="mx-1">•</span>
                              <span className="font-medium">{notice.author || notice.by || notice.adminName || 'School Admin'}</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Action button with animation */}
                        <div className="ml-2 flex-shrink-0 mt-1">
                          <button 
                            onClick={() => redirectToNotice()}
                            className="relative overflow-hidden rounded-full bg-gray-100 hover:bg-[#0a66c2] p-2 transition-colors duration-300"
                          >
                            <FaArrowRight className="text-gray-500 group-hover:text-white transition-colors duration-300" size={10} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : selectedDate ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="relative overflow-hidden rounded-full p-4 mb-3">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-indigo-100 animate-pulse"></div>
                  <FaRegSadCry className="text-[#0a66c2] text-4xl relative z-10" />
                </div>
                <p className="text-sm font-medium text-[#191919] mb-1">No notices for this date</p>
                <p className="text-xs text-[#666666]">There are no announcements or notices scheduled.</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="relative overflow-hidden rounded-full p-4 mb-3">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-indigo-100 animate-pulse"></div>
                  <FaRegCalendarAlt className="text-[#0a66c2] text-4xl relative z-10" />
                </div>
                <p className="text-sm font-medium text-[#191919] mb-1">Select a date</p>
                <p className="text-xs text-[#666666]">Click on a date to view notices.</p>
              </div>
            )}
          </div>
          
          {/* Pagination - Redesigned */}
          {selectedDate && totalNoticePages > 1 && (
            <div className="border-t border-gray-100 pt-3 pb-3 px-4">
              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-500">
                  Page <span className="font-medium text-[#0a66c2]">{currentNoticePage}</span> of <span className="font-medium">{totalNoticePages}</span>
                </div>
                
                <div className="relative flex items-center bg-gray-50 rounded-full p-1">
                  <button
                    onClick={() => paginateNotices(currentNoticePage - 1)}
                    disabled={currentNoticePage === 1}
                    className={`
                      relative overflow-hidden rounded-full p-1.5 mx-0.5
                      ${currentNoticePage === 1 
                        ? 'text-gray-300 cursor-not-allowed' 
                        : 'text-gray-600 hover:text-[#0a66c2] hover:bg-blue-50'}
                      transition-colors focus:outline-none
                    `}
                  >
                    <FaChevronLeft size={11} />
                  </button>
                  
                  {[...Array(totalNoticePages).keys()].map(number => {
                    const isActive = currentNoticePage === number + 1;
                    return (
                      <button
                        key={number + 1}
                        onClick={() => paginateNotices(number + 1)}
                        className={`
                          relative w-7 h-7 mx-0.5 rounded-full text-xs font-medium flex items-center justify-center
                          transition-all duration-200 overflow-hidden
                          ${isActive 
                            ? 'text-white' 
                            : 'text-gray-500 hover:text-[#0a66c2] hover:bg-blue-50'}
                          focus:outline-none
                        `}
                      >
                        {isActive && (
                          <span className="absolute inset-0 bg-gradient-to-r from-[#0a66c2] to-[#0077b5] rounded-full animate-gradient"></span>
                        )}
                        <span className={`relative z-10 ${isActive ? 'text-white' : ''}`}>{number + 1}</span>
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => paginateNotices(currentNoticePage + 1)}
                    disabled={currentNoticePage === totalNoticePages}
                    className={`
                      relative overflow-hidden rounded-full p-1.5 mx-0.5
                      ${currentNoticePage === totalNoticePages 
                        ? 'text-gray-300 cursor-not-allowed' 
                        : 'text-gray-600 hover:text-[#0a66c2] hover:bg-blue-50'}
                      transition-colors focus:outline-none
                    `}
                  >
                    <FaChevronRight size={11} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f8f9fa; 
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #d1d5db; 
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #adb5bd; 
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        @keyframes popUpNotice {
          0% {
            transform: translateY(4px) scale(0.95);
            opacity: 0.7;
          }
          50% {
            transform: translateY(-2px) scale(1.05);
          }
          100% {
            transform: translateY(0) scale(1.03);
            opacity: 1;
          }
        }
        
        .notice-glow {
          box-shadow: 0 0 5px rgba(10, 102, 194, 0.5), 0 0 10px rgba(10, 102, 194, 0.3);
        }
        
        @keyframes gradient {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </div>
  );
};

export default Calendar; 