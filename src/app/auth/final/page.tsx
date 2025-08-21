import Image from "next/image";

export default function FinalPage() {
  return (
    <div className="!bg-[url('/images/mobile/bg-one.jpg')] bg-no-repeat bg-cover bg-center min-h-screen py-25">
    <div className="flex justify-center items-center flex-col text-center">
      <div>
        <Image src={'/logo.svg'} alt="logo" height={115} width={300} quality={100} />
        <Image src={'/images/mobile/01.svg'} alt="logo" height={350} width={300} quality={100} />
      </div>
      <div className="mt-1">
        <h3 className="md:text-xl text-base text-white font-bold">Effortless Access. Every Time.</h3>
        <p className="md:text-base text-sm text-white mt-2">Experience a new, secure <br /> and seamless way to enter.</p>
      </div>
    </div>
    </div>
  );
}
