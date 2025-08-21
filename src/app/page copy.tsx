import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <>
    <div className="flex justify-center items-center flex-col min-h-screen text-center">
      <div>
        <h2 className="text-2xl font-bold">Welcome To</h2>
        <Image src={'/icon-logo.svg'} alt="logo" height={115} width={144} quality={100} />
      </div>
      <div className="mt-12">
        <h3 className="text-xl font-bold">Effortless Access. Every Time.</h3>
        <p className="text-base">Experience a new, secure <br /> and seamless way to enter.</p>
        <Link className="inline-block mt-5 text-base font-bold rounded-lg bg-[#6A1084] text-white py-4 px-20 mb-2" href={'/auth/register'}>Get Started</Link>
        <p>Already have an account?<Link href={'/auth/login'}>Log in</Link></p>
      </div>
    </div>
    </>
  );
}
