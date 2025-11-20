"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useGeolocation } from "react-use";
import { formatInTimeZone, toZonedTime } from "date-fns-tz";
import { getSriLankaNews } from "@/app/actions";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/traveler/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
        const res = await fetch("https://api.frankfurter.app/latest?from=USD");
        const data = await res.json();
        setRates({ USD: 1, ...data.rates, LKR: data.rates.LKR || 302.05 });
      } catch {
        setRates({ USD: 1, LKR: 302.05, EUR: 0.92 });
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
          <main className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-4 sm:mb-6 gap-3">
              <div className="w-full sm:w-auto">
                <div className="lg:hidden mb-2"><SidebarTrigger /></div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900">Dashboard</h1>
                <p className="text-gray-500 text-xs sm:text-sm">{currentDate}</p>
              </div>
              <div className="text-left sm:text-right w-full sm:w-auto">
                <p className="text-2xl sm:text-3xl font-light text-gray-800">{currentTime}</p>
              </div>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4">
              {/* --- Currency / Timezone Converter --- */}
              <Card className="lg:col-span-7 shadow-sm border-gray-100 bg-white">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3">
                    <div>
                      <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Converter</p>
                      <h2 className="text-lg sm:text-2xl font-semibold text-gray-900">
                        {isTimeZoneMode ? "Time Zone" : "Currency"}
                      </h2>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <span className="text-xs sm:text-sm text-gray-600">Currency</span>
                      <Switch checked={isTimeZoneMode} onCheckedChange={setIsTimeZoneMode} />
                      <span className="text-xs sm:text-sm text-gray-600">Time Zone</span>
                    </div>
                  </div>

                  {!isTimeZoneMode ? (
                    <>
                      <div className="mb-4 sm:mb-4">
                        <div className="flex flex-col sm:flex-row items-start sm:items-baseline gap-2">
                          <h2 className="text-2xl sm:text-4xl font-bold text-gray-900">
                            {amount || "1"} {fromCurrency}
                          </h2>
                          <span className="text-xl sm:text-2xl text-gray-500">→</span>
                          <h2 className="text-2xl sm:text-4xl font-bold text-blue-600">
                            {convertedAmount || "0.00"} {toCurrency}
                          </h2>
                        </div>
                        <p className="text-xs text-gray-400 mt-2">Live rates via Frankfurter API</p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div className="space-y-3">
                          <Input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="text-base sm:text-lg font-medium h-10 sm:h-12"
                            placeholder="Amount"
                          />
                          <Select value={fromCurrency} onValueChange={setFromCurrency}>
                            <SelectTrigger className="h-10 sm:h-12">
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
                        <div className="space-y-3">
                          <Input
                            readOnly
                            value={convertedAmount || ""}
                            className="text-base sm:text-lg font-medium h-10 sm:h-12 bg-gray-50"
                            placeholder="Result"
                          />
                          <Select value={toCurrency} onValueChange={setToCurrency}>
                            <SelectTrigger className="h-10 sm:h-12">
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
                      <div className="mb-4  text-center py-4 rounded-2xl">
                        <p className="text-3xl sm:text-5xl font-bold text-gray-800">{convertedTime}</p>
                        <p className="text-base sm:text-lg text-gray-600 mt-2">{convertedAmount}</p>
                        <p className="text-xs sm:text-sm text-gray-500 mt-1">
                          {toZone.country} • {toZone.zone.split("/")[1]?.replace(/_/g, " ")}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        <div>
                          <label className="text-xs sm:text-sm font-medium text-gray-600">From</label>
                          <Select value={fromZone.zone} onValueChange={(v) => setFromZone(TIMEZONES.find(t => t.zone === v) || fromZone)}>
                            <SelectTrigger className="mt-2 h-10 sm:h-12">
                              <div className="flex items-center gap-2 sm:gap-3">
                                <span className="text-xl sm:text-2xl">{fromZone.flag}</span>
                                <span className="text-sm sm:text-base">{fromZone.country}</span>
                              </div>
                            </SelectTrigger>
                            <SelectContent>
                              {TIMEZONES.map((tz) => (
                                <SelectItem key={tz.zone} value={tz.zone}>
                                  <div className="flex items-center gap-2 sm:gap-3">
                                    <span className="text-lg sm:text-xl">{tz.flag}</span>
                                    <span className="text-sm">{tz.country}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="text-xs sm:text-sm font-medium text-gray-600">To</label>
                          <Select value={toZone.zone} onValueChange={(v) => setToZone(TIMEZONES.find(t => t.zone === v) || toZone)}>
                            <SelectTrigger className="mt-2 h-10 sm:h-12">
                              <div className="flex items-center gap-2 sm:gap-3">
                                <span className="text-xl sm:text-2xl">{toZone.flag}</span>
                                <span className="text-sm sm:text-base">{toZone.country}</span>
                              </div>
                            </SelectTrigger>
                            <SelectContent>
                              {TIMEZONES.map((tz) => (
                                <SelectItem key={tz.zone} value={tz.zone}>
                                  <div className="flex items-center gap-2 sm:gap-3">
                                    <span className="text-lg sm:text-xl">{tz.flag}</span>
                                    <span className="text-sm">{tz.country}</span>
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
              <Card className="lg:col-span-5 border-none shadow-md overflow-hidden relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-900" />
                
                {/* Navigation Buttons */}
                <button
                  onClick={prevCarousel}
                  className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/20 hover:bg-white/30 p-1.5 sm:p-2 rounded-full transition-all backdrop-blur-sm"
                >
                  <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </button>
                <button
                  onClick={nextCarousel}
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/20 hover:bg-white/30 p-1.5 sm:p-2 rounded-full transition-all backdrop-blur-sm"
                >
                  <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </button>

                {/* Carousel Indicators */}
                <div className="absolute top-3 sm:top-4 right-3 sm:right-4 z-10 flex gap-1.5 sm:gap-2">
                  {[0, 1, 2].map((i) => (
                    <button
                      key={i}
                      onClick={() => setCarouselIndex(i)}
                      className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all ${
                        carouselIndex === i ? "bg-white w-4 sm:w-6" : "bg-white/40"
                      }`}
                    />
                  ))}
                </div>

                <CardContent className="relative p-4 sm:p-6 text-white h-full flex flex-col justify-between min-h-[240px] sm:min-h-[280px]">
                  {/* Weather View */}
                  {carouselIndex === 0 && (
                    <>
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-5xl sm:text-6xl font-bold tracking-tighter">{weather.temp}°</h3>
                          <p className="text-slate-300 font-medium mt-1 text-sm sm:text-base">{weather.condition}</p>
                        </div>
                        <WeatherIcon className="h-10 w-10 sm:h-12 sm:w-12 text-slate-200/80" />
                      </div>
                      <div className="mt-auto">
                        <div className="flex items-center gap-1 text-slate-300 mb-1">
                          <MapPin className="h-3 w-3" />
                          <span className="text-xs font-medium uppercase tracking-wide">{location}</span>
                        </div>
                        <p className="text-[10px] text-slate-400">Last updated: {currentTime}</p>
                      </div>
                    </>
                  )}

                  {/* Calendar View */}
                  {carouselIndex === 1 && (
                    <div className="flex flex-col h-full justify-center items-center">
                      <Calendar className="h-12 w-12 sm:h-16 sm:w-16 mb-3 sm:mb-4 text-slate-200" />
                      <h3 className="text-2xl sm:text-3xl font-bold mb-2">
                        {selectedDate?.toLocaleDateString("en-US", { month: "long", day: "numeric" })}
                      </h3>
                      <p className="text-slate-300 text-sm sm:text-base">
                        {selectedDate?.toLocaleDateString("en-US", { weekday: "long", year: "numeric" })}
                      </p>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" className="mt-4 bg-white/10 border-white/20 hover:bg-white/20 text-white text-xs sm:text-sm">
                            Open Calendar
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader><DialogTitle>Select Date</DialogTitle></DialogHeader>
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
                      <MapPin className="h-12 w-12 sm:h-16 sm:w-16 mb-3 sm:mb-4 text-slate-200" />
                      <h3 className="text-2xl sm:text-3xl font-bold mb-2">{location}</h3>
                      <p className="text-slate-300 text-xs sm:text-sm mb-1">
                        {coordinates.lat.toFixed(4)}°N, {coordinates.lon.toFixed(4)}°E
                      </p>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" className="mt-4 bg-white/10 border-white/20 hover:bg-white/20 text-white text-xs sm:text-sm">
                            View on Map
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl">
                          <DialogHeader><DialogTitle>Your Location</DialogTitle></DialogHeader>
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
              <Card className="lg:col-span-12 shadow-sm border-gray-100">
                <CardHeader className="pb-3">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                      <div className="bg-red-100 p-1.5 rounded-md">
                        <Newspaper className="h-4 w-4 text-red-600" />
                      </div>
                      Ada Derana <span className="text-gray-400 font-normal text-xs sm:text-sm">Latest News</span>
                    </CardTitle>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => window.open("http://www.adaderana.lk", "_blank")}
                      className="text-xs sm:text-sm"
                    >
                      View All <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {loadingNews ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin" />
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                      {news.slice(0, 6).map((item, idx) => (
                        <a 
                          key={idx} 
                          href={item.link} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="group"
                        >
                          <div className="flex gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl hover:bg-gray-50 transition border hover:border-gray-200">
                            {item.image ? (
                              <img 
                                src={item.image}
                                alt="" 
                                className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg flex-shrink-0" 
                              />
                            ) : (
                              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                                <Newspaper className="h-8 w-8 sm:h-10 sm:w-10 text-gray-300" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-xs sm:text-sm line-clamp-3 group-hover:text-blue-600">
                                {item.title}
                              </h4>
                              <p className="text-xs text-gray-400 mt-2">{item.date}</p>
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