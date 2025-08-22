"use client";
import Image from "next/image";
import Link from "next/link";
import { useAuthProtection } from "../../../hooks/useAuthProtection";
import { useAppSelector } from "../../../store/hooks";

export default function SelfiePolicyPage() {
  // Auth protection - redirect to register if no user data
  const { isAuthenticated } = useAuthProtection();
  const { registrationData } = useAppSelector((state) => state.auth);

  // Show loading state while checking auth
  if (!isAuthenticated) {
    return (
      <div className="!bg-[url('/images/mobile/bg-two.jpg')] bg-no-repeat bg-cover bg-center min-h-screen pt-20">
        <div className="w-full text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-sm text-[#3F3F3F] font-medium">
            Checking Authentication...
          </p>
        </div>
      </div>
    );
  }

  // Validate enrollment status
  if (registrationData?.enrollmentStatus !== 'pending') {
    return (
      <div className="!bg-[url('/images/mobile/bg-two.jpg')] bg-no-repeat bg-cover bg-center min-h-screen pt-20">
        <div className="w-full text-center">
          <p className="text-sm text-[#3F3F3F] font-medium">
            Invalid enrollment status. Please register again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative !bg-[url('/images/mobile/bg-two.jpg')] bg-no-repeat bg-cover bg-center min-h-screen pt-20">
    <Image
      src={"/images/mobile/bg-2.png"}
      alt="logo"
      quality={100}
      fill={true}
      className="mx-auto lg:object-contain object-cover absolute top-0 left-0 blur-xs"
    />
      <div className="w-full absolute top-0 left-0">
        <Image
          src={"/icon_logo.png"}
          alt="logo"
          height={100}
          width={100}
          quality={100}
          className="mx-auto mb-12 mt-10"
        />
        <div className="grid grid-cols-2 gap-5 max-w-[330px] mx-auto">
          <div className="text-center">
            <Image
              src={"/icon/01.png"}
              alt="logo"
              width={26}
              height={21}
              className="mx-auto h-6"
            />
            <p className="text-sm  font-medium mt-1 text-white">
              Plain Background
            </p>
          </div>
          <div className="text-center">
            <Image
              src={"/icon/03.png"}
              alt="logo"
              width={26}
              height={21}
              className="mx-auto h-6"
            />
            <p className="text-sm text-[#3F3F3F] font-medium mt-1 text-white">
              Use neutral expression
            </p>
          </div>
          <div className="text-center">
            <Image
              src={"/icon/04.png"}
              alt="logo"
              width={26}
              height={21}
              className="mx-auto h-6"
            />
            <p className="text-sm text-[#3F3F3F] font-medium mt-1 text-white">
              Center your face
            </p>
          </div>
          <div className="text-center">
            <Image
              src={"/icon/02.png"}
              alt="logo"
              width={26}
              height={21}
              className="mx-auto h-6"
            />
            <p className="text-sm text-[#3F3F3F] font-medium mt-1 text-white">
              Even lighting
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-5 max-w-[290px] mx-auto mt-12 mb-6 text-white">
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
          <label className="flex items-center gap-2 text-xs  font-medium max-w-[230px] mx-auto text-white">
            <input type="checkbox" />I agree to the privacy policy
          </label>
          <div className="text-center  mt-4 max-auto">
            
          <Link
            href={"/auth/selfie"}
            className="mobile-btn !text-[#323232] mb-5"
          >
            Take A Selfie
          </Link>
          </div>
      </div>
      
    </div>
  );
}
