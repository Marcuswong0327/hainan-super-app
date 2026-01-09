import { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import {
  CreditCard,
  Gift,
  Heart,
  BookOpen,
  Trophy,
  QrCode,
} from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { MyPassPage } from './MyPassPage';
import { DonatePage } from './DonatePage';
import { LoansPage } from './LoansPage';
import { EventBookingPage } from './EventBookingPage';
import { NotificationPanel } from './NotificationPanel';
import { RoleSwitcher } from './RoleSwitcher';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '../ui/carousel';


interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  venue: string;
  price: number;
  description: string;
  imageUrl: string;
  status: string;
  maxCapacity?: number;
  currentParticipants?: number;
}


export function PublicHomePage() {
  const { user, signOut } = useAuth();
  const [currentPage, setCurrentPage] = useState<'home' | 'mypass' | 'donate' | 'loans' | 'booking'>('home');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [api, setApi] = useState<any>(null);


  // Frontend-only demo data - load approved events from localStorage
  const [events, setEvents] = useState<Event[]>([]);


  useEffect(() => {
    // Load ONLY approved events from localStorage - never show pending or rejected
    const loadApprovedEvents = () => {
      const savedEvents = JSON.parse(localStorage.getItem('myHainanEvents') || '[]');
      // Strictly filter - only show events with status === 'approved'
      const approvedEvents = savedEvents.filter((e: any) => e.status === 'approved');
      setEvents(approvedEvents);
    };


    // Load events on mount
    loadApprovedEvents();

    // Refresh events periodically to catch when super admin approves/rejects
    const interval = setInterval(() => {
      loadApprovedEvents();
    }, 2000); // Check every 2 seconds

    return () => {
      clearInterval(interval);
    };
  }, []);


  // Auto-swipe carousel functionality - automatically moves every 5 seconds
  useEffect(() => {
    if (!api) {
      return;
    }


    let intervalId: ReturnType<typeof setInterval>;
    const startAutoScroll = () => {
      intervalId = setInterval(() => {
        if (api.canScrollNext()) {
          api.scrollNext();
        } else {
          // Reset to first slide when reaching the end
          api.scrollTo(0);
        }
      }, 5000); // Auto-swipe every 5 seconds
    };


    startAutoScroll();


    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [api]);


  const [loan] = useState<any>(null); // No loan for demo


  // Handle page navigation
  if (currentPage === 'mypass') {
    return <MyPassPage onBack={() => setCurrentPage('home')} />;
  }


  if (currentPage === 'donate') {
    return <DonatePage onBack={() => setCurrentPage('home')} />;
  }


  if (currentPage === 'loans') {
    return <LoansPage onBack={() => setCurrentPage('home')} />;
  }


  if (currentPage === 'booking' && selectedEvent) {
    return <EventBookingPage event={selectedEvent} onBack={() => {
      setCurrentPage('home');
      setSelectedEvent(null);
    }} />;
  }


  const getDonorBadgeDisplay = () => {
    if (user?.donorBadge === 'gold') {
      return '🥇 Gold Donor';
    } else if (user?.donorBadge === 'bronze') {
      return '🥉 Bronze Donor';
    }
    return '';
  };


  const getPointsProgress = () => {
    const points = user?.points || 0;
    if (points >= 1000) return 100;
    return (points / 1000) * 100;
  };


  const quickActions = [
    { icon: QrCode, label: 'My Pass', subtitle: '我的通行证', color: 'bg-blue-500' },
    { icon: Heart, label: 'Donate', subtitle: '捐款', color: 'bg-red-500' },
    { icon: CreditCard, label: 'Loans', subtitle: '贷学金', color: 'bg-green-500' },
    { icon: BookOpen, label: 'AGM', subtitle: '会员大会', color: 'bg-purple-500' },
    { icon: Gift, label: 'Dialect', subtitle: '学乡音', color: 'bg-orange-500' },
    { icon: Trophy, label: 'Points', subtitle: '积分兑换', color: 'bg-yellow-500' },
  ];


  const featuredImages = [
    'https://res.cloudinary.com/dxi6fkbmr/image/upload/v1767593005/AGM_nh3yga.png',
    'https://res.cloudinary.com/dxi6fkbmr/image/upload/v1767593217/%E6%B8%A9%E6%83%85%E6%BB%BF%E4%BA%BA%E9%97%B4-scaled_hgry8v.jpg',
    'https://res.cloudinary.com/dxi6fkbmr/image/upload/v1767593004/DSC_8676-scaled_ojkkfc.jpg',
  ];


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <div>
                <h1 className="font-bold text-xl">Hi {user?.name}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-gray-600">海南会会员</span>
                  {getDonorBadgeDisplay() && (
                    <>
                      <span className="text-gray-400">|</span>
                      <span className="text-sm">{getDonorBadgeDisplay()}</span>
                    </>
                  )}
                </div>
              </div>
              {/* Switch Account Button - Show if user has multiple roles */}
              {user?.roles && user.roles.length > 1 && (
                <div className="ml-4">
                  <RoleSwitcher />
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <NotificationPanel userId={user?.id} />
            <Button variant="outline" size="sm" onClick={signOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </div>


      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Featured Carousel with Auto-Swipe */}
        <div className="relative w-full">
          <Carousel
            setApi={setApi}
            opts={{
              align: "start",
              loop: true,
              dragFree: true, // Allow manual dragging/swiping
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {featuredImages.map((img, idx) => (
                <CarouselItem key={idx} className="pl-2 md:pl-4 basis-full md:basis-1/2 lg:basis-1/3">
                  <Card className="overflow-hidden">
                    <ImageWithFallback
                      src={img}
                      alt={`Featured ${idx + 1}`}
                      className="w-full h-48 object-cover"
                    />
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white border" />
            <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white border" />
          </Carousel>
        </div>


        {/* Quick Action Grid */}
        <div>
          <h2 className="font-semibold mb-3">Quick Actions</h2>
          <div className="grid grid-cols-3 gap-4">
            {quickActions.map((action, idx) => (
              <Card
                key={idx}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => {
                  if (action.label === 'My Pass') {
                    setCurrentPage('mypass');
                  } else if (action.label === 'Donate') {
                    setCurrentPage('donate');
                  } else if (action.label === 'Loans') {
                    setCurrentPage('loans');
                  }
                }}
              >
                <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                  <div className={`${action.color} p-4 rounded-full mb-3`}>
                    <action.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="font-medium">{action.label}</div>
                  <div className="text-xs text-gray-500 mt-1">{action.subtitle}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>


        {/* Loan Tracker (if exists) */}
        {loan && (
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Loan Repayment</h3>
                <Badge variant="outline">Active</Badge>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Monthly Goal (Dec)</span>
                  <span className="font-medium">
                    RM {loan.paidAmount % loan.monthlyPayment}/{loan.monthlyPayment}
                  </span>
                </div>
                <Progress
                  value={((loan.paidAmount % loan.monthlyPayment) / loan.monthlyPayment) * 100}
                  className="h-2 bg-green-100"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Pay by 30th to earn 50 Points
                </p>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Total Progress</span>
                  <span className="text-gray-600">
                    RM {loan.paidAmount}/{loan.totalAmount}
                  </span>
                </div>
                <Progress
                  value={(loan.paidAmount / loan.totalAmount) * 100}
                  className="h-1 bg-gray-100"
                />
              </div>
            </CardContent>
          </Card>
        )}


        {/* Upcoming Events Feed */}
        <div>
          <h2 className="font-semibold mb-3">Upcoming Events</h2>
          <div className="space-y-4">
            {events.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-gray-500">
                  No upcoming events at this time.
                </CardContent>
              </Card>
            ) : (
              events.map((event) => (
                <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="flex">
                    <ImageWithFallback
                      src={event.imageUrl}
                      alt={event.title}
                      className="w-32 h-32 object-cover flex-shrink-0"
                    />
                    <CardContent className="p-4 flex-1">
                      <h3 className="font-semibold mb-1">{event.title}</h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {event.date} · {event.time}
                      </p>
                      <p className="text-sm text-gray-500 mb-2">{event.venue}</p>
                      {event.maxCapacity && (
                        <p className="text-sm text-gray-600 mb-2">
                          Max Capacity: {event.maxCapacity} participants
                          {event.currentParticipants !== undefined && event.maxCapacity && event.currentParticipants >= event.maxCapacity && (
                            <span className="ml-2 text-red-600 font-medium">(Full)</span>
                          )}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-red-600">RM {event.price}</span>
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedEvent(event);
                            setCurrentPage('booking');
                          }}
                          disabled={event.maxCapacity !== undefined && event.currentParticipants !== undefined && event.currentParticipants >= event.maxCapacity}
                        >
                          {event.maxCapacity !== undefined && event.currentParticipants !== undefined && event.currentParticipants >= event.maxCapacity 
                            ? 'Full' 
                            : 'Book Now'}
                        </Button>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

