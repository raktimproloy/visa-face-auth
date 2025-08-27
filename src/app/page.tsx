import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="!bg-[url('/images/mobile/bg-one.jpg')] bg-no-repeat bg-cover bg-center min-h-screen py-25">
      <div className="flex justify-center items-center flex-col text-center">
        <div className="flex flex-col items-center">
          <h2 className="md:text-2xl text-base text-[#DEDEDE] font-bold">
            Welcome To
          </h2>
          <Image
            src={"/logo.svg"}
            alt="logo"
            height={129}
            width={246}
            quality={100}
          />
          <Image
            src={"/images/mobile/01.png"}
            alt="logo"
            height={350}
            width={300}
            quality={100}
            className="opacity-20"
          />
        </div>
        <div className="">
          <h3 className="md:text-xl text-base text-white font-bold" style={{fontSize:"16px"}}>
            Effortless Access. Every Time.
          </h3>
          <p className="md:text-base text-sm text-white mt-2" style={{fontSize:"14px"}}>
            Experience a new, secure <br /> and seamless way to enter.
          </p>
          <Link className="mobile-btn !mt-10" href={"/auth/register"}>
            Get Started
          </Link>
          {/* <p className="md:text-base text-xs text-[#CCCAD2] font-normal text-center mt-3">
            Already have an account?<Link href={"/auth/login"}> Log in</Link>
          </p> */}
        </div>
      </div>
    </div>
  );
}
