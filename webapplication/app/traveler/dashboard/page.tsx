"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useGeolocation } from "react-use";
import { formatInTimeZone, toZonedTime } from "date-fns-tz";
import { getSriLankaNews } from "@/app/actions";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/traveler/Sidebar";
import { AdDisplay } from "@/components/traveler/AdDisplay";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Loader2, CloudRain, Calendar, MapPin,  Phone,  Sun, Cloud, CloudLightning, Newspaper, ArrowRight,  AlertTriangle, Ambulance, Shield, ChevronLeft, ChevronRight } from "lucide-react";

// Leaflet
const MapContainer = dynamic(() => import("react-leaflet").then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then(mod => mod.Popup), { ssr: false });

// --- Emergency Contacts ---
const EMERGENCY_CONTACTS = [
  { name: "Police Emergency", number: "119", icon: Shield, color: "bg-blue-600" },
  { name: "Ambulance Service", number: "1990", icon: Ambulance, color: "bg-red-600" },
  { name: "Fire & Rescue", number: "110", icon: AlertTriangle, color: "bg-orange-600" },
  { name: "Accident Service", number: "1938", icon: Phone, color: "bg-purple-600" },
  { name: "Disaster Management", number: "117", icon: AlertTriangle, color: "bg-yellow-600" },
];

// --- Time Zones & Countries ---
const TIMEZONES = [
  { country: "Sri Lanka", zone: "Asia/Colombo", flag: "🇱🇰" },
  { country: "United States", zone: "America/New_York", flag: "🇺🇸" },
  { country: "United Kingdom", zone: "Europe/London", flag: "🇬🇧" },
  { country: "India", zone: "Asia/Kolkata", flag: "🇮🇳" },
  { country: "Australia", zone: "Australia/Sydney", flag: "🇦🇺" },
  { country: "Japan", zone: "Asia/Tokyo", flag: "🇯🇵" },
  { country: "Germany", zone: "Europe/Berlin", flag: "🇩🇪" },
  { country: "UAE", zone: "Asia/Dubai", flag: "🇦🇪" },
];

const CURRENCY_LIST = [
  { code: "USD", name: "US Dollar" },
  { code: "EUR", name: "Euro" },
  { code: "GBP", name: "British Pound" },
  { code: "LKR", name: "Sri Lankan Rupee" },
  { code: "JPY", name: "Japanese Yen" },
  { code: "AUD", name: "Australian Dollar" },
  { code: "INR", name: "Indian Rupee" },
];

const weatherCodeMap: Record<number, { label: string; icon: any }> = {
  0: { label: "Clear", icon: Sun },
  1: { label: "Mainly clear", icon: Sun },
  2: { label: "Partly cloudy", icon: Cloud },
  3: { label: "Overcast", icon: Cloud },
  45: { label: "Fog", icon: Cloud },
  51: { label: "Drizzle", icon: CloudRain },
  61: { label: "Rain", icon: CloudRain },
  95: { label: "Thunderstorm", icon: CloudLightning },
};

export default function DashboardPage() {
  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  // Carousel state (0: Weather, 1: Calendar, 2: Map)
  const [carouselIndex, setCarouselIndex] = useState(0);

  // Location & Weather
  const geo = useGeolocation();
  const [location, setLocation] = useState("Locating...");
  const [coordinates, setCoordinates] = useState({ lat: 6.9271, lon: 79.8612 });
  const [weather, setWeather] = useState({ temp: "--", condition: "Loading...", code: 0 });
  const [forecast, setForecast] = useState<any[]>([]);

  // Currency & Timezone Toggle
  const [isTimeZoneMode, setIsTimeZoneMode] = useState(false);
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("LKR");
  const [fromZone, setFromZone] = useState(TIMEZONES[0]);
  const [toZone, setToZone] = useState(TIMEZONES[3]);
  const [amount, setAmount] = useState("1");
  const [convertedAmount, setConvertedAmount] = useState("");
  const [convertedTime, setConvertedTime] = useState("");
  const [rates, setRates] = useState<Record<string, number>>({});

  // News
  const [news, setNews] = useState<any[]>([]);
  const [loadingNews, setLoadingNews] = useState(true);

  // --- Time Update ---
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
      setCurrentDate(now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // --- Fetch News ---
  useEffect(() => {
    async function loadNews() {
      const data = await getSriLankaNews();
      setNews(data);
      setLoadingNews(false);
    }
    loadNews();
  }, []);

  // --- Currency Rates ---
  useEffect(() => {
    const fetchRates = async () => {
      try {
        // Using ExchangeRate-API which supports LKR with accurate rates
        const res = await fetch("https://open.er-api.com/v6/latest/USD");
        const data = await res.json();
        
        if (data.result === "success" && data.rates) {
          setRates({ USD: 1, ...data.rates });
        } else {
          throw new Error("Invalid API response");
        }
      } catch (error) {
        console.error("Failed to fetch currency rates:", error);
        // Fallback rates (approximate values as of late 2024)
        setRates({ 
          USD: 1, 
          LKR: 305, 
          EUR: 0.92, 
          GBP: 0.79, 
          JPY: 149, 
          AUD: 1.52, 
          INR: 83 
        });
      }
    };
    fetchRates();
  }, []);

  // --- Currency Conversion ---
  useEffect(() => {
    if (isTimeZoneMode) return;
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) {
      setConvertedAmount("");
      return;
    }
    const fromRate = rates[fromCurrency] || 1;
    const toRate = rates[toCurrency] || 1;
    setConvertedAmount(((val * toRate) / fromRate).toFixed(2));
  }, [amount, fromCurrency, toCurrency, rates, isTimeZoneMode]);

  // --- Time Zone Conversion ---
  useEffect(() => {
    if (!isTimeZoneMode) return;
    const now = new Date();
    const formatted = formatInTimeZone(now, toZone.zone, "h:mm a");
    const dateStr = formatInTimeZone(now, toZone.zone, "EEE, MMM d");
    setConvertedTime(formatted);
    setConvertedAmount(dateStr);
  }, [isTimeZoneMode, fromZone, toZone]);

  // --- Weather & Location ---
  useEffect(() => {
    const lat = geo.latitude || 6.9271;
    const lon = geo.longitude || 79.8612;

    const getLocWeather = async () => {
      try {
        const [geoRes, weatherRes] = await Promise.all([
          fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`),
          fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto`),
        ]);
        const geoData = await geoRes.json();
        const wData = await weatherRes.json();

        setLocation(geoData.city || geoData.locality || "Sri Lanka");
        setCoordinates({ lat, lon });
        setWeather({
          temp: Math.round(wData.current_weather.temperature).toString(),
          condition: weatherCodeMap[wData.current_weather.weathercode]?.label || "Clear",
          code: wData.current_weather.weathercode,
        });

        if (wData.daily) {
          setForecast(
            wData.daily.time.map((t: string, i: number) => ({
              date: new Date(t).toLocaleDateString("en-US", { weekday: "short" }),
              max: Math.round(wData.daily.temperature_2m_max[i]),
              min: Math.round(wData.daily.temperature_2m_min[i]),
              code: wData.daily.weathercode[i],
            })).slice(1, 6)
          );
        }
      } catch (err) {
        setLocation("Colombo");
        setWeather({ temp: "28", condition: "Cloudy", code: 3 });
      }
    };

    getLocWeather();
  }, [geo.latitude, geo.longitude]);

  const WeatherIcon = weatherCodeMap[weather.code]?.icon || Cloud;

  const nextCarousel = () => setCarouselIndex((prev) => (prev + 1) % 3);
  const prevCarousel = () => setCarouselIndex((prev) => (prev - 1 + 3) % 3);

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-gradient-to-br from-gray-50 to-gray-100">
        <AppSidebar />

        <div className="flex-1 flex flex-col overflow-hidden">
          <AdDisplay />
          <main className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6">
            {/* Header */}
            <div className="flex justify-between items-start sm:items-end mb-4 sm:mb-6 gap-2 sm:gap-3">
              <div className="flex-1 min-w-0">
                <div className="hidden md:block mb-2"><SidebarTrigger /></div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold tracking-tight text-gray-900 font-poppins">
                  Dashboard
                </h1>
                <p className="text-gray-600 text-xs sm:text-sm lg:text-base mt-1 truncate">{currentDate}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-2xl sm:text-3xl lg:text-4xl font-light text-gray-800 font-poppins">{currentTime}</p>
              </div>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 lg:gap-6">
              {/* --- Currency / Timezone Converter --- */}
              <Card className="lg:col-span-7 bg-white/95 backdrop-blur-md border-2 border-gray-100 shadow-xl">
                <CardContent className="p-4 sm:p-5 lg:p-8">
                  <div className="flex items-center justify-between mb-4 sm:mb-5 lg:mb-6 gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Converter</p>
                      <h2 className="text-base sm:text-lg lg:text-xl xl:text-2xl font-bold text-gray-900 font-poppins mt-1 truncate">
                        {isTimeZoneMode ? "Time Zone" : "Currency"}
                      </h2>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2 bg-gray-50 p-1.5 rounded-lg flex-shrink-0">
                      <span className="text-xs font-medium text-gray-700 hidden sm:inline">Currency</span>
                      <span className="text-xs font-medium text-gray-700 sm:hidden">Curr</span>
                      <Switch checked={isTimeZoneMode} onCheckedChange={setIsTimeZoneMode} />
                      <span className="text-xs font-medium text-gray-700 hidden sm:inline">Time Zone</span>
                      <span className="text-xs font-medium text-gray-700 sm:hidden">Zone</span>
                    </div>
                  </div>

                  {!isTimeZoneMode ? (
                    <>
                      <div className="mb-4 sm:mb-5 lg:mb-6">
                        <div className="flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2 lg:gap-3 flex-wrap">
                          <h2 className="text-2xl xs:text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 font-poppins break-words">
                            {amount || "1"} {fromCurrency}
                          </h2>
                          <span className="text-xl xs:text-2xl sm:text-3xl lg:text-4xl text-amber-500 flex-shrink-0">→</span>
                          <h2 className="text-2xl xs:text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-amber-600 font-poppins break-words">
                            {convertedAmount || "0.00"} {toCurrency}
                          </h2>
                        </div>
                        <p className="text-xs text-gray-500 mt-2 sm:mt-3 font-medium text-center sm:text-left">Live rates via ExchangeRate-API</p>
                      </div>

                      <div className="grid grid-cols-2 gap-2 sm:gap-4 lg:gap-5">
                        <div className="space-y-2 sm:space-y-3 w-full">
                          <label className="text-xs sm:text-sm font-semibold text-gray-700">Amount</label>
                          <Input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-full text-sm sm:text-base lg:text-lg font-medium h-10 sm:h-12 lg:h-14 border-2 focus:border-amber-500 px-2 sm:px-3"
                            placeholder="Amount"
                          />
                          <Select value={fromCurrency} onValueChange={setFromCurrency}>
                            <SelectTrigger className="w-full h-10 sm:h-12 lg:h-14 border-2 text-sm sm:text-base">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {CURRENCY_LIST.map((c) => (
                                <SelectItem key={c.code} value={c.code}>
                                  {c.name} ({c.code})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2 sm:space-y-3 w-full">
                          <label className="text-xs sm:text-sm font-semibold text-gray-700">Converted</label>
                          <Input
                            readOnly
                            value={convertedAmount || ""}
                            className="w-full text-sm sm:text-base lg:text-lg font-medium h-10 sm:h-12 lg:h-14 bg-amber-50 border-2 border-amber-200 px-2 sm:px-3"
                            placeholder="Result"
                          />
                          <Select value={toCurrency} onValueChange={setToCurrency}>
                            <SelectTrigger className="w-full h-10 sm:h-12 lg:h-14 border-2 text-sm sm:text-base">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {CURRENCY_LIST.map((c) => (
                                <SelectItem key={c.code} value={c.code}>
                                  {c.name} ({c.code})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="mb-4 sm:mb-5 lg:mb-6 text-center py-4 sm:py-5 lg:py-6 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-100">
                        <p className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-800 font-poppins">{convertedTime}</p>
                        <p className="text-base sm:text-lg lg:text-xl text-gray-600 mt-2 sm:mt-3 font-medium">{convertedAmount}</p>
                        <p className="text-xs sm:text-sm text-gray-500 mt-1.5 sm:mt-2 px-4">
                          {toZone.country} • {toZone.zone.split("/")[1]?.replace(/_/g, " ")}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:gap-6">
                        <div className="w-full">
                          <label className="text-xs sm:text-sm font-semibold text-gray-700 mb-2 block">From</label>
                          <Select value={fromZone.zone} onValueChange={(v) => setFromZone(TIMEZONES.find(t => t.zone === v) || fromZone)}>
                            <SelectTrigger className="w-full h-10 sm:h-12 lg:h-14 border-2">
                              <div className="flex items-center gap-2">
                                <span className="text-lg sm:text-xl lg:text-2xl">{fromZone.flag}</span>
                                <span className="text-xs sm:text-sm lg:text-base font-medium truncate">{fromZone.country}</span>
                              </div>
                            </SelectTrigger>
                            <SelectContent>
                              {TIMEZONES.map((tz) => (
                                <SelectItem key={tz.zone} value={tz.zone}>
                                  <div className="flex items-center gap-2">
                                    <span className="text-base sm:text-lg">{tz.flag}</span>
                                    <span className="text-xs sm:text-sm">{tz.country}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="w-full">
                          <label className="text-xs sm:text-sm font-semibold text-gray-700 mb-2 block">To</label>
                          <Select value={toZone.zone} onValueChange={(v) => setToZone(TIMEZONES.find(t => t.zone === v) || toZone)}>
                            <SelectTrigger className="w-full h-10 sm:h-12 lg:h-14 border-2">
                              <div className="flex items-center gap-2">
                                <span className="text-lg sm:text-xl lg:text-2xl">{toZone.flag}</span>
                                <span className="text-xs sm:text-sm lg:text-base font-medium truncate">{toZone.country}</span>
                              </div>
                            </SelectTrigger>
                            <SelectContent>
                              {TIMEZONES.map((tz) => (
                                <SelectItem key={tz.zone} value={tz.zone}>
                                  <div className="flex items-center gap-2">
                                    <span className="text-base sm:text-lg">{tz.flag}</span>
                                    <span className="text-xs sm:text-sm">{tz.country}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* --- Carousel Card (Weather/Calendar/Map) --- */}
              <Card className="lg:col-span-5 border-2 border-gray-200 shadow-xl overflow-hidden relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500 via-orange-500 to-red-500" />
                
                {/* Navigation Buttons */}
                <button
                  onClick={prevCarousel}
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-10 bg-white/30 hover:bg-white/40 p-2 sm:p-2.5 rounded-full transition-all backdrop-blur-sm shadow-lg"
                >
                  <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </button>
                <button
                  onClick={nextCarousel}
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-10 bg-white/30 hover:bg-white/40 p-2 sm:p-2.5 rounded-full transition-all backdrop-blur-sm shadow-lg"
                >
                  <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </button>

                {/* Carousel Indicators */}
                <div className="absolute top-4 sm:top-5 right-4 sm:right-5 z-10 flex gap-2">
                  {[0, 1, 2].map((i) => (
                    <button
                      key={i}
                      onClick={() => setCarouselIndex(i)}
                      className={`w-2 h-2 rounded-full transition-all shadow-md ${
                        carouselIndex === i ? "bg-white w-8" : "bg-white/50"
                      }`}
                    />
                  ))}
                </div>

                <CardContent className="relative p-5 sm:p-6 lg:p-8 text-white h-full flex flex-col justify-between min-h-[280px] sm:min-h-[320px]">
                  {/* Weather View */}
                  {carouselIndex === 0 && (
                    <>
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-6xl sm:text-7xl font-bold tracking-tighter font-poppins drop-shadow-lg">{weather.temp}°</h3>
                          <p className="text-white/90 font-semibold mt-2 text-base sm:text-lg">{weather.condition}</p>
                        </div>
                        <WeatherIcon className="h-14 w-14 sm:h-16 sm:w-16 text-white/90 drop-shadow-lg" />
                      </div>
                      <div className="mt-auto">
                        <div className="flex items-center gap-1.5 text-white/90 mb-1.5">
                          <MapPin className="h-4 w-4" />
                          <span className="text-sm font-semibold uppercase tracking-wide">{location}</span>
                        </div>
                        <p className="text-xs text-white/70">Last updated: {currentTime}</p>
                      </div>
                    </>
                  )}

                  {/* Calendar View */}
                  {carouselIndex === 1 && (
                    <div className="flex flex-col h-full justify-center items-center">
                      <Calendar className="h-16 w-16 sm:h-20 sm:w-20 mb-4 sm:mb-5 text-white drop-shadow-lg" />
                      <h3 className="text-3xl sm:text-4xl font-bold mb-2 font-poppins">
                        {selectedDate?.toLocaleDateString("en-US", { month: "long", day: "numeric" })}
                      </h3>
                      <p className="text-white/90 text-base sm:text-lg font-medium">
                        {selectedDate?.toLocaleDateString("en-US", { weekday: "long", year: "numeric" })}
                      </p>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" className="mt-5 bg-white/20 border-2 border-white/40 hover:bg-white/30 text-white text-sm sm:text-base font-semibold shadow-lg">
                            Open Calendar
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle className="font-poppins">Select Date</DialogTitle>
                            <DialogDescription className="sr-only">Choose a date from the calendar</DialogDescription>
                          </DialogHeader>
                          <CalendarComponent
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            className="rounded-md border"
                          />
                        </DialogContent>
                      </Dialog>
                    </div>
                  )}

                  {/* Map/Location View */}
                  {carouselIndex === 2 && (
                    <div className="flex flex-col h-full justify-center items-center">
                      <MapPin className="h-16 w-16 sm:h-20 sm:w-20 mb-4 sm:mb-5 text-white drop-shadow-lg" />
                      <h3 className="text-3xl sm:text-4xl font-bold mb-3 font-poppins">{location}</h3>
                      <p className="text-white/90 text-sm sm:text-base font-medium mb-1">
                        {coordinates.lat.toFixed(4)}°N, {coordinates.lon.toFixed(4)}°E
                      </p>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" className="mt-5 bg-white/20 border-2 border-white/40 hover:bg-white/30 text-white text-sm sm:text-base font-semibold shadow-lg">
                            View on Map
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl">
                          <DialogHeader>
                            <DialogTitle className="font-poppins">Your Location</DialogTitle>
                            <DialogDescription className="sr-only">View your current location on an interactive map</DialogDescription>
                          </DialogHeader>
                          <div className="h-[300px] sm:h-[400px] rounded-lg overflow-hidden">
                            <MapContainer
                              center={[coordinates.lat, coordinates.lon]}
                              zoom={13}
                              style={{ height: "100%", width: "100%" }}
                            >
                              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                              <Marker position={[coordinates.lat, coordinates.lon]}>
                                <Popup>{location}</Popup>
                              </Marker>
                            </MapContainer>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  )}
                </CardContent>
              </Card>


              {/* --- News Section --- */}
              <Card className="lg:col-span-12 bg-white/95 backdrop-blur-md border-2 border-gray-100 shadow-xl">
                <CardHeader className="pb-4 px-5 sm:px-6 lg:px-8 pt-5 sm:pt-6 lg:pt-8">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <CardTitle className="flex items-center gap-3 text-lg sm:text-xl font-poppins">
                      <div className="bg-red-100 p-2 rounded-lg">
                        <Newspaper className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
                      </div>
                      <span className="font-bold">Ada Derana</span> 
                      <span className="text-gray-500 font-normal text-sm sm:text-base">Latest News</span>
                    </CardTitle>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => window.open("http://www.adaderana.lk", "_blank")}
                      className="text-sm sm:text-base font-semibold text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                    >
                      View All <ArrowRight className="ml-1.5 h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="px-5 sm:px-6 lg:px-8 pb-5 sm:pb-6 lg:pb-8">
                  {loadingNews ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="h-8 w-8 sm:h-10 sm:w-10 animate-spin text-amber-500" />
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                      {news.slice(0, 6).map((item, idx) => (
                        <a 
                          key={idx} 
                          href={item.link} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="group"
                        >
                          <div className="flex gap-4 p-4 sm:p-5 rounded-xl hover:bg-amber-50 transition-all border-2 border-gray-100 hover:border-amber-200 hover:shadow-md">
                            {item.image ? (
                              <img 
                                src={item.image}
                                alt="" 
                                className="w-24 h-24 sm:w-28 sm:h-28 object-cover rounded-lg flex-shrink-0 border-2 border-gray-100" 
                              />
                            ) : (
                              <div className="w-24 h-24 sm:w-28 sm:h-28 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center border-2 border-gray-200">
                                <Newspaper className="h-10 w-10 sm:h-12 sm:w-12 text-gray-300" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-sm sm:text-base line-clamp-3 group-hover:text-amber-600 transition-colors">
                                {item.title}
                              </h4>
                              <p className="text-xs text-gray-500 mt-2 font-medium">{item.date}</p>
                            </div>
                          </div>
                        </a>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}