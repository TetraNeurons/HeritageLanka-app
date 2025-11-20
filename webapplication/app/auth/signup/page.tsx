'use client';

import { useState, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axiosInstance from '@/lib/axios';
import { PhoneInput } from 'react-international-phone';
import ISO6391 from 'iso-639-1';
import countries from 'world-countries';
import 'react-international-phone/style.css';
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react";
import Header from '@/components/Header';

const CURRENT_YEAR = new Date().getFullYear();
const BIRTH_YEARS = Array.from({ length: 100 }, (_, i) => CURRENT_YEAR - 18 - i);

export default function SignUpPage() {
  const router = useRouter();
  const languageInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(1);
  const [role, setRole] = useState('TRAVELER');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form data
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [gender, setGender] = useState('');
  const [country, setCountry] = useState('');
  const [nic, setNic] = useState('');

  // Languages with chip input
  const [languages, setLanguages] = useState<string[]>([]);
  const [languageInput, setLanguageInput] = useState('');
  const [languageSuggestions, setLanguageSuggestions] = useState<string[]>([]);

  // Get all languages from ISO-639-1 library
  const allLanguages = useMemo(() => {
    return ISO6391.getAllNames().sort();
  }, []);

  // Get all countries from world-countries library
  const allCountries = useMemo(() => {
    return countries
      .map(country => country.name.common)
      .sort((a, b) => a.localeCompare(b));
  }, []);

  // Language autocomplete
  const handleLanguageInputChange = (value: string) => {
    setLanguageInput(value);
    if (value.length > 0) {
      const filtered = allLanguages.filter(lang =>
        lang.toLowerCase().includes(value.toLowerCase()) &&
        !languages.includes(lang)
      );
      setLanguageSuggestions(filtered.slice(0, 8));
    } else {
      setLanguageSuggestions([]);
    }
  };

  const addLanguage = (language: string) => {
    if (language && !languages.includes(language)) {
      setLanguages([...languages, language]);
      setLanguageInput('');
      setLanguageSuggestions([]);
      languageInputRef.current?.focus();
    }
  };

  const removeLanguage = (language: string) => {
    setLanguages(languages.filter(lang => lang !== language));
  };

  const handleLanguageKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && languageInput.trim()) {
      e.preventDefault();
      const exactMatch = allLanguages.find(
        lang => lang.toLowerCase() === languageInput.trim().toLowerCase()
      );
      if (exactMatch) {
        addLanguage(exactMatch);
      } else if (languageSuggestions.length > 0) {
        addLanguage(languageSuggestions[0]);
      }
    } else if (e.key === 'Backspace' && !languageInput && languages.length > 0) {
      removeLanguage(languages[languages.length - 1]);
    }
  };

  // Form validation
  const canProceedStep1 = name && email && phoneNumber && password.length >= 6;
  const canProceedStep2 = birthYear && gender && languages.length > 0 && country && (role === 'TRAVELER' || nic);

  async function handleSubmit() {
    setLoading(true);
    setError('');

    try {
      const response = await axiosInstance.post('/api/auth/signup', {
        name,
        email,
        phone: phoneNumber,
        password,
        role,
        birthYear: parseInt(birthYear),
        gender,
        languages,
        country,
        nic: role === 'GUIDE' ? nic : undefined,
      });

      if (response.data.success) {
        // Redirect based on role
        const userRole = response.data.user.role;
        switch (userRole) {
          case 'ADMIN':
            router.push('/admin/dashboard');
            break;
          case 'GUIDE':
            router.push('/guide/dashboard');
            break;
          case 'TRAVELER':
          default:
            router.push('/traveler/dashboard');
            break;
        }
        router.refresh();
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Signup failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-muted/20 to-background">
      <Header />

      <main className="flex-1 flex items-center justify-center p-4 pt-24 pb-8">
        <Card className="w-full max-w-md shadow-lg border-muted">
          <CardHeader className="space-y-1 text-center pb-6">
            <CardTitle className="text-3xl font-bold tracking-tight">
              Create an account
            </CardTitle>
            <CardDescription className="text-base">
              Join Ceylon360 - Step {step} of 2
            </CardDescription>
          </CardHeader>

          <CardContent>
            {error && (
              <div className="bg-destructive/15 border border-destructive/30 text-destructive text-sm p-3 rounded-lg mb-6 flex items-start gap-2">
                <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* Progress Indicator */}
            <div className="flex justify-between mb-6">
              {[1, 2].map(s => (
                <div
                  key={s}
                  className={`h-2 flex-1 mx-1 rounded-full transition-colors ${s <= step ? 'bg-primary' : 'bg-muted'
                    }`}
                />
              ))}
            </div>

            {/* STEP 1: Basic Info */}
            {step === 1 && (
              <div className="space-y-5">
                <Tabs value={role} onValueChange={setRole} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 h-11">
                    <TabsTrigger value="TRAVELER" className="text-sm font-medium">
                      Traveler
                    </TabsTrigger>
                    <TabsTrigger value="GUIDE" className="text-sm font-medium">
                      Guide
                    </TabsTrigger>
                  </TabsList>
                </Tabs>

                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="John Doe"
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="john@example.com"
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <PhoneInput
                    defaultCountry="lk"
                    value={phoneNumber}
                    onChange={(phone) => setPhoneNumber(phone)}
                    className="w-full"
                    inputClassName="h-11 w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    placeholder="Minimum 6 characters"
                    className="h-11"
                  />
                </div>

                <Button
                  onClick={() => setStep(2)}
                  className="w-full h-11"
                  disabled={!canProceedStep1}
                >
                  Continue
                </Button>
              </div>
            )}

            {/* STEP 2: Personal Details */}
            {step === 2 && (
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label>Birth Year</Label>
                  <Select value={birthYear} onValueChange={setBirthYear}>
                    <SelectTrigger className="h-11 w-full">
                      <SelectValue placeholder="Select birth year" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      {BIRTH_YEARS.map(year => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Gender</Label>
                  <Select value={gender} onValueChange={setGender}>
                    <SelectTrigger className="h-11 w-full">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MALE">Male</SelectItem>
                      <SelectItem value="FEMALE">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Country</Label>
                  <Select value={country} onValueChange={setCountry}>
                    <SelectTrigger className="h-11 w-full">
                      <SelectValue placeholder="Select your country" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      {allCountries.map(c => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {role === 'GUIDE' && (
                  <div className="space-y-2">
                    <Label htmlFor="nic">NIC Number</Label>
                    <Input
                      id="nic"
                      value={nic}
                      onChange={(e) => setNic(e.target.value)}
                      required
                      placeholder="Enter your NIC number"
                      className="h-11"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Languages You Speak</Label>
                  <div className="space-y-2">
                    {/* Language Chips */}
                    {languages.length > 0 && (
                      <div className="flex flex-wrap gap-2 p-2 border rounded-md bg-muted/30 min-h-[50px]">
                        {languages.map((lang) => (
                          <Badge key={lang} variant="secondary" className="pl-3 pr-1 py-1 flex items-center gap-1">
                            <span>{lang}</span>
                            <button
                              type="button"
                              onClick={() => removeLanguage(lang)}
                              className="hover:bg-muted rounded-full p-0.5 transition-colors"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Language Input with Autocomplete */}
                    <div className="relative">
                      <Input
                        ref={languageInputRef}
                        value={languageInput}
                        onChange={(e) => handleLanguageInputChange(e.target.value)}
                        onKeyDown={handleLanguageKeyDown}
                        placeholder="Type to search languages... (Press Enter to add)"
                        className="h-11"
                      />
                      {languageSuggestions.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-popover border rounded-md shadow-lg max-h-60 overflow-y-auto">
                          {languageSuggestions.map((lang) => (
                            <div
                              key={lang}
                              className="px-4 py-2 hover:bg-muted cursor-pointer transition-colors text-sm"
                              onClick={() => addLanguage(lang)}
                            >
                              {lang}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {languages.length === 0 ? 'Add at least one language' : `${languages.length} language${languages.length > 1 ? 's' : ''} added`}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="flex-1 h-11"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    className="flex-1 h-11"
                    disabled={!canProceedStep2 || loading}
                  >
                    {loading ? "Creating account..." : "Sign Up"}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter>
            <p className="text-center text-sm w-full">
              Already have an account?
              <Link href="/auth/signin" className="text-primary ml-1 hover:underline">Sign In</Link>
            </p>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}