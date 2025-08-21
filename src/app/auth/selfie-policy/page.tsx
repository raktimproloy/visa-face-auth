"use client";
import Image from "next/image";
import Link from "next/link";
import { useAuthProtection } from "../../../hooks/useAuthProtection";

export default function SelfiePolicyPage() {
  // Auth protection - redirect to register if no user data
  const { isAuthenticated } = useAuthProtection();

  // Show loading state while checking auth
  if (!isAuthenticated) {
    return (
      <div className="!bg-[url('/images/mobile/bg-two.jpg')] bg-no-repeat bg-cover bg-center min-h-screen pt-20">
        <div className="w-full text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-sm text-[#3F3F3F] font-medium">
            Checking Registration...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="!bg-[url('/images/mobile/bg-two.jpg')] bg-no-repeat bg-cover bg-center min-h-screen pt-20">
      <div className="w-full">
        <Image
          src={"/icon-logo.svg"}
          alt="logo"
          height={107}
          width={136}
          quality={100}
          className="mx-auto mb-12"
        />
        <div className="grid grid-cols-2 gap-5 max-w-[330px] mx-auto">
          <div className="text-center">
            <Image
              src={"/images/mobile/icon/01.svg"}
              alt="logo"
              width={26}
              height={21}
              className="mx-auto h-6"
            />
            <p className="text-sm text-[#3F3F3F] font-medium mt-1">
              Plain Background
            </p>
          </div>
          <div className="text-center">
            <Image
              src={"/images/mobile/icon/02.svg"}
              alt="logo"
              width={26}
              height={21}
              className="mx-auto h-6"
            />
            <p className="text-sm text-[#3F3F3F] font-medium mt-1">
              Use neutral expression
            </p>
          </div>
          <div className="text-center">
            <Image
              src={"/images/mobile/icon/03.svg"}
              alt="logo"
              width={26}
              height={21}
              className="mx-auto h-6"
            />
            <p className="text-sm text-[#3F3F3F] font-medium mt-1">
              Center your face
            </p>
          </div>
          <div className="text-center">
            <Image
              src={"/images/mobile/icon/04.svg"}
              alt="logo"
              width={26}
              height={21}
              className="mx-auto h-6"
            />
            <p className="text-sm text-[#3F3F3F] font-medium mt-1">
              Even lighting
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-5 max-w-[290px] mx-auto mt-12 mb-14">
          <div className="text-center">
            <Image
              src={"/images/01.png"}
              alt="logo"
              width={130}
              height={170}
              className="mx-auto h-[160px]"
            />
          </div>
          <div className="text-center">
            <Image
              src={"/images/02.png"}
              alt="logo"
              width={130}
              height={170}
              className="mx-auto h-[160px]"
            />
          </div>
        </div>
          <label className="flex items-center gap-2 mb-3 text-xs text-[#323232] font-medium max-w-[230px] mx-auto">
            <input type="checkbox" />I agree to the user agreement
          </label>
          <label className="flex items-center gap-2 text-xs text-[#323232] font-medium max-w-[230px] mx-auto">
            <input type="checkbox" />I agree to the privacy policy
          </label>
          <div className="text-center  mt-12 max-auto">
            
          <Link
            href={"/auth/selfie"}
            className="mobile-btn !text-[#323232]"
          >
            Take A Selfie
          </Link>
          </div>
      </div>
      
    </div>
  );
}
