import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-6">
          <Link href="/">
            <Button variant="outline" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 font-poppins">
            Privacy Policy
          </h1>
          <p className="text-gray-600 mt-2">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <Card className="bg-white/95 backdrop-blur-md shadow-xl border-2 border-gray-200">
          <CardHeader>
            <CardTitle className="font-poppins text-2xl">
              What Information We Collect
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* User Account Information */}
            <section>
              <h3 className="text-xl font-semibold mb-4 text-gray-800">
                1. User Account Information
              </h3>
              <div className="space-y-3 text-gray-700">
                <p><strong>Personal Details:</strong></p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Email address (for account access and communication)</li>
                  <li>Password (encrypted and securely stored)</li>
                  <li>Full name</li>
                  <li>Phone number</li>
                  <li>Birth year</li>
                  <li>Gender</li>
                  <li>Languages spoken</li>
                  <li>Country of residence</li>
                </ul>
              </div>
            </section>

            {/* Profile Information */}
            <section>
              <h3 className="text-xl font-semibold mb-4 text-gray-800">
                2. Profile Information
              </h3>
              <div className="space-y-3 text-gray-700">
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Profile image/avatar</li>
                  <li>Personal bio (up to 500 characters)</li>
                  <li>User ratings and reviews</li>
                  <li>Account creation and last update timestamps</li>
                </ul>
              </div>
            </section>

            {/* Trip and Travel Data */}
            <section>
              <h3 className="text-xl font-semibold mb-4 text-gray-800">
                3. Trip and Travel Data
              </h3>
              <div className="space-y-3 text-gray-700">
                <p><strong>Trip Planning:</strong></p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Trip dates, destinations, and itineraries</li>
                  <li>Number of travelers</li>
                  <li>Travel preferences (religious, casual, adventure)</li>
                  <li>AI-generated trip recommendations and summaries</li>
                  <li>Location data for trip planning and verification</li>
                  <li>Daily itinerary details stored as structured data</li>
                </ul>
              </div>
            </section>

            {/* Guide-Specific Information */}
            <section>
              <h3 className="text-xl font-semibold mb-4 text-gray-800">
                4. Guide-Specific Information
              </h3>
              <div className="space-y-3 text-gray-700">
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>National Identity Card (NIC) number for verification</li>
                  <li>Verification status and documents</li>
                  <li>Guide ratings and review history</li>
                  <li>Trip acceptance/declination records</li>
                </ul>
              </div>
            </section>

            {/* Payment and Financial Data */}
            <section>
              <h3 className="text-xl font-semibold mb-4 text-gray-800">
                5. Payment and Financial Data
              </h3>
              <div className="space-y-3 text-gray-700">
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Payment amounts and transaction history</li>
                  <li>Stripe session IDs (for payment processing)</li>
                  <li>Payment status and timestamps</li>
                  <li>Event ticket purchases and quantities</li>
                </ul>
                <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
                  <strong>Note:</strong> We do not store credit card numbers or sensitive payment details. 
                  All payment processing is handled securely by Stripe.
                </p>
              </div>
            </section>

            {/* Usage and Analytics Data */}
            <section>
              <h3 className="text-xl font-semibold mb-4 text-gray-800">
                6. Usage and Analytics Data
              </h3>
              <div className="space-y-3 text-gray-700">
                <p><strong>API Usage Tracking:</strong></p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Search queries and location searches</li>
                  <li>API usage statistics and response times</li>
                  <li>AI workflow usage (trip planning, recommendations)</li>
                  <li>System performance metrics</li>
                </ul>
              </div>
            </section>

            {/* Reviews and Feedback */}
            <section>
              <h3 className="text-xl font-semibold mb-4 text-gray-800">
                7. Reviews and Feedback
              </h3>
              <div className="space-y-3 text-gray-700">
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Reviews between travelers and guides</li>
                  <li>Rating scores and written comments</li>
                  <li>System feedback and satisfaction surveys</li>
                  <li>User experience feedback and suggestions</li>
                </ul>
              </div>
            </section>

            {/* Location and Verification Data */}
            <section>
              <h3 className="text-xl font-semibold mb-4 text-gray-800">
                8. Location and Verification Data
              </h3>
              <div className="space-y-3 text-gray-700">
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>GPS coordinates for trip verification</li>
                  <li>Geohash data for location matching</li>
                  <li>One-time passwords (OTP) for trip verification</li>
                  <li>Trip start/end verification timestamps</li>
                </ul>
              </div>
            </section>

            {/* How We Use Your Information */}
            <section>
              <h3 className="text-xl font-semibold mb-4 text-gray-800">
                How We Use Your Information
              </h3>
              <div className="space-y-3 text-gray-700">
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Provide and improve our travel planning services</li>
                  <li>Match travelers with verified guides</li>
                  <li>Process payments and manage bookings</li>
                  <li>Generate AI-powered trip recommendations</li>
                  <li>Verify trip completion and ensure safety</li>
                  <li>Maintain user ratings and review systems</li>
                  <li>Analyze usage patterns to improve our platform</li>
                  <li>Communicate important updates and notifications</li>
                </ul>
              </div>
            </section>

            {/* Data Security */}
            <section>
              <h3 className="text-xl font-semibold mb-4 text-gray-800">
                Data Security
              </h3>
              <div className="space-y-3 text-gray-700">
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>All passwords are encrypted using industry-standard methods</li>
                  <li>Payment processing is handled securely through Stripe</li>
                  <li>Database access is restricted and monitored</li>
                  <li>Regular security audits and updates</li>
                  <li>Secure file storage for profile images and documents</li>
                </ul>
              </div>
            </section>

            {/* Your Rights */}
            <section>
              <h3 className="text-xl font-semibold mb-4 text-gray-800">
                Your Rights
              </h3>
              <div className="space-y-3 text-gray-700">
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Access your personal data</li>
                  <li>Update or correct your information</li>
                  <li>Delete your account and associated data</li>
                  <li>Export your data in a readable format</li>
                  <li>Opt out of non-essential communications</li>
                </ul>
                <div className="bg-blue-50 p-4 rounded-lg mt-4">
                  <p className="text-blue-800">
                    <strong>Account Deletion:</strong> You can delete your account at any time from your profile page. 
                    This will permanently remove all your personal data, though some anonymized analytics data may be retained 
                    for service improvement purposes.
                  </p>
                </div>
              </div>
            </section>

            {/* Contact Information */}
            <section>
              <h3 className="text-xl font-semibold mb-4 text-gray-800">
                Contact Us
              </h3>
              <div className="space-y-3 text-gray-700">
                <p>
                  If you have any questions about this Privacy Policy or how we handle your data, 
                  please contact us through our feedback system or reach out to our support team.
                </p>
              </div>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}