import Image from "next/image";

export default function SuccessComponent() {
  return (
    <div className="p-8">
    <div className="flex justify-center items-center flex-col h-[93vh] text-center !bg-[url('/images/05.jpg')] bg-no-repeat bg-cover bg-center rounded-2xl py-[150px]">
    <h2 className="md:text-[40px] text-3xl text-white font-bold mb-12">You’re Enrolled!</h2>
             <Image
                src={"/logo.svg"}
                alt="logo"
                width={600}
                height={120}
                className="mx-auto"
              />
              <h4 className="mt-auto md:text-[40px] text-3xl text-white font-bold underline">Thank You. </h4>
    </div>
    </div>
  );
}
