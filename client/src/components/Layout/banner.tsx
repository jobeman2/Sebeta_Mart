"use client";

import React from "react";
import {
  Truck,
  ArrowRight,
  ShieldCheck,
  Users,
  UserCheck,
  Clock,
  DollarSign,
  MapPin,
  CheckCircle,
} from "lucide-react";

export default function DeliveryBanner() {
  const handleTeamJoin = () => {
    window.location.href = "/delivery/team-join";
  };

  const handleIndividualJoin = () => {
    window.location.href = "/delivery/individual-join";
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      {/* Premium Delivery Banner */}
      <div className="bg-white border border-gray-100 shadow-lg">
        <div className="p-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Left Section - Visual & Headline */}
            <div className="lg:col-span-5">
              <div className="relative">
                {/* Icon Grid Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-gray-50/30"></div>

                <div className="relative space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#3399FF] to-blue-400 flex items-center justify-center">
                      <Truck className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                        Deliver with Excellence
                      </h1>
                      <p className="text-[#3399FF] font-medium mt-1">
                        Join our trusted network
                      </p>
                    </div>
                  </div>

                  {/* Verification Requirement */}
                  <div className="bg-gray-50 p-5 border-l-4 border-[#EF837B]">
                    <div className="flex items-start gap-3">
                      <ShieldCheck className="w-5 h-5 text-[#3399FF] mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">
                          Verification Required
                        </h3>
                        <p className="text-gray-600 text-sm">
                          All delivery partners must complete identity
                          verification and background check.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Middle Section - Join Options */}
            <div className="lg:col-span-4 border-l border-gray-100 pl-10">
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                Choose Your Path
              </h3>

              <div className="space-y-6">
                {/* Team Option */}
                <div className="group border border-gray-200 hover:border-[#3399FF] transition-all duration-300 p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-50 flex items-center justify-center">
                        <Users className="w-5 h-5 text-[#3399FF]" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">Join a Team</h4>
                        <p className="text-sm text-gray-500">
                          Work with established partners
                        </p>
                      </div>
                    </div>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                  <button
                    onClick={handleTeamJoin}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 text-white font-medium hover:bg-black transition-all duration-200 group-hover:shadow-md"
                  >
                    Join Team <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Individual Option */}
                <div className="group border border-gray-200 hover:border-[#3399FF] transition-all duration-300 p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-50 flex items-center justify-center">
                        <UserCheck className="w-5 h-5 text-[#EF837B]" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">
                          Work Independently
                        </h4>
                        <p className="text-sm text-gray-500">
                          Be your own boss
                        </p>
                      </div>
                    </div>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                  <button
                    onClick={handleIndividualJoin}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#3399FF] text-white font-medium hover:bg-blue-600 transition-all duration-200 group-hover:shadow-md"
                  >
                    Start Solo <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Right Section - Benefits */}
            <div className="lg:col-span-3 border-l border-gray-100 pl-10">
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                Why Join?
              </h3>

              <div className="space-y-5">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-50 flex items-center justify-center flex-shrink-0">
                    <DollarSign className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">
                      Competitive Earnings
                    </h4>
                    <p className="text-sm text-gray-500">Up to 200 Birr tips</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">
                      Flexible Schedule
                    </h4>
                    <p className="text-sm text-gray-500">Choose your hours</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-red-50 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-4 h-4 text-red-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Local Zones</h4>
                    <p className="text-sm text-gray-500">Work in your area</p>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="mt-8 pt-6 border-t border-gray-100">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">500+</div>
                    <div className="text-xs text-gray-500">Active Partners</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">98%</div>
                    <div className="text-xs text-gray-500">Verified</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Section */}
          <div className="mt-10 pt-8 border-t border-gray-100">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-500">
                <span className="font-medium text-gray-700">Requirements:</span>{" "}
                Valid ID • Clean record • Vehicle/Transport • Smartphone
              </div>
              <div className="text-sm">
                <span className="text-[#3399FF] font-medium">
                  ✓ Background check required
                </span>
                <span className="mx-3 text-gray-300">•</span>
                <span className="text-[#EF837B] font-medium">
                  ✓ 3-day approval process
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
