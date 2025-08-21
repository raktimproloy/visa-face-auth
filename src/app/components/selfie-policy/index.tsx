"use client";

import Image from "next/image";
import Link from "next/link";

export default function SelfiePolicy() {
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
        <div className="grid grid-cols-2 gap-7 max-w-[480px] mx-auto mb-9">
          <div className="text-center">
            <Image
              src={"/icon/01.svg"}
              alt="logo"
              width={36}
              height={36}
              className="mx-auto"
            />
            <p className="text-xl font-medium font-inter text-[#8F059B] mt-2">
              Plain Background
            </p>
          </div>
          <div className="text-center">
            <Image
              src={"/icon/02.svg"}
              alt="logo"
              width={36}
              height={36}
              className="mx-auto"
            />
            <p className="text-xl font-medium font-inter text-[#8F059B] mt-2">
              Use neutral expression
            </p>
          </div>
          <div className="text-center">
            <Image
              src={"/icon/03.svg"}
              alt="logo"
              width={36}
              height={36}
              className="mx-auto"
            />
            <p className="text-xl font-medium font-inter text-[#8F059B] mt-2">
              Center your face
            </p>
          </div>
          <div className="text-center">
            <Image
              src={"/icon/04.svg"}
              alt="logo"
              width={36}
              height={36}
              className="mx-auto"
            />
            <p className="text-xl font-medium font-inter text-[#8F059B] mt-2">
              Even lighting
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-8 max-w-[450px] mx-auto">
          <div className="text-center">
            <Image
              src={"/images/01.png"}
              alt="logo"
              width={233}
              height={264}
              className="mx-auto h-[264px]"
            />
            <p className="text-xl font-medium font-inter text-[#8F059B] mt-2">
              Good photo
            </p>
          </div>
          <div className="text-center">
            <Image
              src={"/images/02.png"}
              alt="logo"
              width={233}
              height={264}
              className="mx-auto h-[264px]"
            />
            <p className="text-xl font-medium font-inter text-[#8F059B] mt-2">
              Bad photo
            </p>
          </div>
        </div>
      </div>
      <div className="w-full text-center">
        <div className="bottom-box">
          <label className="flex items-center gap-2 mb-3 text-base text-[#696F79] font-medium font-inter max-w-[260px] mx-auto">
            <input type="checkbox" />I agree to the user agreement
          </label>
          <label className="flex items-center gap-2 text-base text-[#696F79] font-medium font-inter max-w-[260px] mx-auto">
            <input type="checkbox" />I agree to the privacy policy
          </label>

          <Link
            href={"/auth/selfie"}
            className="w-[210px] block text-base font-bold rounded-lg bg-[#6A1084] text-white py-3 px-10 text-center mt-9 mx-auto"
          >
            Take A Selfie
          </Link>
        </div>
      </div>
    </div>
  );
}
