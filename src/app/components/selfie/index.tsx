"use client";

import Image from "next/image";
import Link from "next/link";

export default function Selfie() {
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
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="23"
            height="20"
            viewBox="0 0 23 20"
            fill="none"
          >
            <g clip-path="url(#clip0_2214_240)">
              <path
                d="M21.0834 9.2333V9.99997C21.0822 11.797 20.413 13.5455 19.1756 14.9848C17.9383 16.4241 16.199 17.477 14.2172 17.9866C12.2355 18.4961 10.1174 18.4349 8.17889 17.8121C6.24038 17.1894 4.58531 16.0384 3.46052 14.5309C2.33573 13.0233 1.80149 11.24 1.93746 9.4469C2.07343 7.65377 2.87234 5.94691 4.21504 4.58086C5.55773 3.21482 7.37227 2.26279 9.38803 1.86676C11.4038 1.47073 13.5128 1.65192 15.4004 2.3833M21.0834 3.3333L11.5 11.675L8.62503 9.17497"
                stroke="#0BFD05"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </g>
            <defs>
              <clipPath id="clip0_2214_240">
                <rect width="23" height="20" fill="white" />
              </clipPath>
            </defs>
          </svg>
          Hold still
        </Link>
        <Image
          src={"/images/03.jpg"}
          alt="logo"
          width={600}
          height={411}
          className="mx-auto"
        />
      </div>
      <div className="w-full text-center">
        <Link
          href={"/auth/selfie-review"}
          className="max-w-[320px] w-full text-base font-bold rounded-lg bg-[#53C04B] text-white py-4 px-10 text-center mt-9 mx-auto flex items-center gap-2 justify-center mb-10"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="20"
            viewBox="0 0 24 20"
            fill="none"
          >
            <g clip-path="url(#clip0_2214_257)">
              <path
                d="M22.5416 15.8333C22.5416 16.2754 22.3397 16.6993 21.9803 17.0118C21.6208 17.3244 21.1333 17.5 20.625 17.5H3.37498C2.86665 17.5 2.37914 17.3244 2.01969 17.0118C1.66025 16.6993 1.45831 16.2754 1.45831 15.8333V6.66667C1.45831 6.22464 1.66025 5.80072 2.01969 5.48816C2.37914 5.17559 2.86665 5 3.37498 5H7.20831L9.12498 2.5H14.875L16.7916 5H20.625C21.1333 5 21.6208 5.17559 21.9803 5.48816C22.3397 5.80072 22.5416 6.22464 22.5416 6.66667V15.8333Z"
                stroke="white"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M12 14.1667C14.1171 14.1667 15.8333 12.6743 15.8333 10.8333C15.8333 8.99238 14.1171 7.5 12 7.5C9.88289 7.5 8.16665 8.99238 8.16665 10.8333C8.16665 12.6743 9.88289 14.1667 12 14.1667Z"
                stroke="white"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </g>
            <defs>
              <clipPath id="clip0_2214_257">
                <rect
                  width="23"
                  height="20"
                  fill="white"
                  transform="translate(0.5)"
                />
              </clipPath>
            </defs>
          </svg>
          Take photo now
        </Link>
      </div>
    </div>
  );
}
