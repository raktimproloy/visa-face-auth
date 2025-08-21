"use client";

import Image from "next/image";
import Link from "next/link";

export default function SelfieReview() {
  return (
    <div className="flex flex-col items-center justify-between w-screen min-h-screen overflow-hidden">
      <div className="w-full">
        <div className="bg-grad py-1 px-4 text-center mb-12">
          <Image
            src={"/logo.svg"}
            alt="logo"
            width={430}
            height={80}
            className="mx-auto"
          />
        </div>

        <Link
          href={"/auth/selfie-policy"}
          className="max-w-[490px] w-full text-base font-bold rounded-lg bg-[#8F059B] text-white py-3 px-10 text-center mt-9 mx-auto flex items-center gap-2 justify-center mb-32"
        >
          Hold still
        </Link>
        <Image
          src={"/images/04.jpg"}
          alt="logo"
          width={600}
          height={411}
          className="mx-auto"
        />
      </div>
      
      <div className="w-full text-center">
        <div className="bottom-box !shadow-none flex items-center justify-center gap-12 w-full !max-w-[520px]">
          <Link
            href={"/auth/selfie"}
            className="w-[210px] text-base font-bold rounded-lg bg-[#FF8D01] text-white py-3 px-10 text-center mt-9 mx-auto flex items-center gap-2 justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="23" height="20" viewBox="0 0 23 20" fill="none">
  <g clip-path="url(#clip0_2214_437)">
    <path d="M22.0417 15.8333C22.0417 16.2754 21.8398 16.6993 21.4803 17.0118C21.1209 17.3244 20.6334 17.5 20.125 17.5H2.87504C2.36671 17.5 1.8792 17.3244 1.51975 17.0118C1.16031 16.6993 0.958374 16.2754 0.958374 15.8333V6.66667C0.958374 6.22464 1.16031 5.80072 1.51975 5.48816C1.8792 5.17559 2.36671 5 2.87504 5H6.70837L8.62504 2.5H14.375L16.2917 5H20.125C20.6334 5 21.1209 5.17559 21.4803 5.48816C21.8398 5.80072 22.0417 6.22464 22.0417 6.66667V15.8333Z" stroke="#D9D9D9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M11.5 14.1667C13.6171 14.1667 15.3334 12.6743 15.3334 10.8333C15.3334 8.99238 13.6171 7.5 11.5 7.5C9.38295 7.5 7.66671 8.99238 7.66671 10.8333C7.66671 12.6743 9.38295 14.1667 11.5 14.1667Z" stroke="#D9D9D9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
  <defs>
    <clipPath id="clip0_2214_437">
      <rect width="23" height="20" fill="white"/>
    </clipPath>
  </defs>
</svg>
            Retake
          </Link>
          <Link
            href={"/auth/success"}
            className="w-[210px] text-base font-bold rounded-lg bg-[#6A1084] text-white py-3 px-10 text-center mt-9 mx-auto flex items-center gap-2 justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="23" height="20" viewBox="0 0 23 20" fill="none">
  <path d="M20.125 12.5V15.8333C20.125 16.2754 19.9231 16.6993 19.5636 17.0118C19.2042 17.3244 18.7167 17.5 18.2083 17.5H4.79167C4.28334 17.5 3.79582 17.3244 3.43638 17.0118C3.07693 16.6993 2.875 16.2754 2.875 15.8333V12.5M16.2917 6.66667L11.5 2.5M11.5 2.5L6.70833 6.66667M11.5 2.5V12.5" stroke="#D9D9D9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
            Upload
          </Link>
        </div>
      </div>
    </div>
  );
}
