"use client"

import { useEffect, useState } from "react"
import { AlertTriangle, X, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"

interface DisasterEvent {
  title: string
  description: string
  eventType: string
  alertLevel: string
  country: string
  link: string
}

export default function DisasterAlert() {
  const [disasters, setDisasters] = useState<DisasterEvent[]>([])
  const [showBanner, setShowBanner] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    const fetchDisasters = async () => {
      try {
        const response = await fetch("/api/disasters")
        if (response.ok) {
          const data = await response.json()
          if (data.disasters && data.disasters.length > 0) {
            setDisasters(data.disasters)
            // Check if user has already dismissed the alert in this session
            const dismissed = sessionStorage.getItem("disaster-alert-dismissed")
            if (!dismissed) {
              setShowBanner(true)
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch disaster alerts:", error)
      }
    }

    fetchDisasters()
  }, [])

  const handleDismiss = () => {
    setShowBanner(false)
    sessionStorage.setItem("disaster-alert-dismissed", "true")
  }

  if (!showBanner || disasters.length === 0) return null

  const getDisasterTypeLabel = (eventType: string) => {
    const types: Record<string, string> = {
      FL: "Flood",
      TC: "Tropical Cyclone",
      EQ: "Earthquake",
      TS: "Tsunami",
      DR: "Drought",
      WF: "Wildfire",
      VO: "Volcanic Activity",
    }
    return types[eventType] || "Disaster"
  }

  const isFloodOrCyclone = (eventType: string) => {
    return ["FL", "TC"].includes(eventType)
  }

  return (
    <div className="w-full bg-white border-b border-gray-200 animate-fade-in mt-20">
      {/* Collapsed Banner */}
      {!isExpanded && (
        <div
          className="bg-gradient-to-r from-orange-50 to-red-50 border-l-4 border-red-500 cursor-pointer hover:bg-red-50 transition-all"
          onClick={() => setIsExpanded(true)}
        >
          <div className="container mx-auto px-4 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="h-4 w-4 text-red-600 animate-pulse flex-shrink-0" />
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-semibold text-sm text-red-700">
                  Disaster Alert:
                </p>
                <p className="text-sm text-gray-700">
                  {disasters.length} active {disasters.length === 1 ? "alert" : "alerts"} in Sri Lanka
                </p>
                <span className="text-xs text-gray-500 hidden sm:inline">
                  • Click for details
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <ChevronDown className="h-4 w-4 text-gray-600" />
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation()
                  handleDismiss()
                }}
                className="hover:bg-red-100 text-gray-600 h-7 w-7"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Expanded Details */}
      {isExpanded && (
        <div className="bg-gradient-to-b from-red-50 to-white border-b border-red-200">
          <div className="container mx-auto px-4 py-3">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-red-700">
                    Disaster Alert - Sri Lanka
                  </h3>
                  <p className="text-xs text-gray-600">
                    Please be careful, there is distress in Sri Lanka
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsExpanded(false)}
                  className="hover:bg-gray-100 h-7 w-7"
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleDismiss}
                  className="hover:bg-gray-100 h-7 w-7"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Disasters List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 mb-3">
              {disasters.map((disaster, index) => (
                <div
                  key={index}
                  className="p-2.5 bg-white border border-red-200 rounded-lg shadow-sm"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="px-2 py-0.5 bg-red-600 text-white text-xs font-bold rounded uppercase">
                      {disaster.alertLevel}
                    </span>
                    <span className="text-xs font-semibold text-gray-700">
                      {getDisasterTypeLabel(disaster.eventType)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-700 mb-1.5 line-clamp-2">
                    {disaster.description}
                  </p>
                  <a
                    href={disaster.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline"
                  >
                    View Details →
                  </a>
                </div>
              ))}
            </div>

            {/* Help Links */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {disasters.some((d) => isFloodOrCyclone(d.eventType)) && (
                <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs font-semibold text-blue-900 mb-1">
                    🗺️ Find Safe Areas
                  </p>
                  <a
                    href="https://floodsupport.org/map"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline"
                  >
                    View Flood Support Map →
                  </a>
                </div>
              )}

              <div className="p-2.5 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-xs font-semibold text-green-900 mb-1">
                  ❤️ Help Those Affected
                </p>
                <a
                  href="https://donate.gov.lk/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-green-600 hover:underline"
                >
                  Donate to Relief Efforts →
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
