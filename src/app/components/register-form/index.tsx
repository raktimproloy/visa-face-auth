// export default function RegisterForm() {
//   return (
//     <>
//       <form className="grid grid-cols-2 gap-x-4 max-w-[360px]">
//         <div className="col-span-1 mb-7">
//           <label
//             htmlFor="first_name"
//             className="block text-base font-normal mb-2"
//           >
//             First name
//           </label>
//           <input
//             type="text"
//             className="form-control"
//             id="first_name"
//             name="first_name"
//           />
//         </div>
//         <div className="col-span-1 mb-7">
//           <label
//             htmlFor="last_name"
//             className="block text-base font-normal mb-2"
//           >
//             Last name
//           </label>
//           <input
//             type="text"
//             className="form-control"
//             id="last_name"
//             name="last_name"
//           />
//         </div>
//         <div className="col-span-2 mb-7">
//           <label htmlFor="email" className="block text-base font-normal mb-2">
//             Email
//           </label>
//           <input
//             type="email"
//             className="form-control"
//             id="email"
//             name="email"
//           />
//         </div>
//         <div className="col-span-2 mb-3">
//           <label
//             htmlFor="password"
//             className="block text-base font-normal mb-2"
//           >
//             Password
//           </label>
//           <input
//             type="password"
//             className="form-control"
//             id="password"
//             name="password"
//           />
//         </div>
//         <div className="col-span-2">
//           <ul>
//             <li className="flex items-center gap-2 text-xs font-medium mb-3">
//               <div className="icon">
//                 <svg
//                   xmlns="http://www.w3.org/2000/svg"
//                   width="16"
//                   height="16"
//                   viewBox="0 0 16 16"
//                   fill="none"
//                 >
//                   <path
//                     d="M13.3334 4L6.00008 11.3333L2.66675 8"
//                     stroke="#465FF1"
//                     stroke-opacity="0.25"
//                     stroke-width="1.5"
//                     stroke-linecap="round"
//                     stroke-linejoin="round"
//                   />
//                 </svg>
//               </div>
//               <p>Password Strength : Weak</p>
//             </li>
//             <li className="flex items-center gap-2 text-xs font-medium mb-3">
//               <div className="icon">
//                 <svg
//                   xmlns="http://www.w3.org/2000/svg"
//                   width="16"
//                   height="16"
//                   viewBox="0 0 16 16"
//                   fill="none"
//                 >
//                   <path
//                     d="M13.3334 4L6.00008 11.3333L2.66675 8"
//                     stroke="#465FF1"
//                     stroke-opacity="0.25"
//                     stroke-width="1.5"
//                     stroke-linecap="round"
//                     stroke-linejoin="round"
//                   />
//                 </svg>
//               </div>
//               <p>Cannot contain your name or email address</p>
//             </li>
//             <li className="flex items-center gap-2 text-xs font-medium mb-3">
//               <div className="icon">
//                 <svg
//                   xmlns="http://www.w3.org/2000/svg"
//                   width="16"
//                   height="16"
//                   viewBox="0 0 16 16"
//                   fill="none"
//                 >
//                   <path
//                     d="M13.3334 4L6.00008 11.3333L2.66675 8"
//                     stroke="#465FF1"
//                     stroke-opacity="0.25"
//                     stroke-width="1.5"
//                     stroke-linecap="round"
//                     stroke-linejoin="round"
//                   />
//                 </svg>
//               </div>
//               <p>At least 8 characters</p>
//             </li>
//             <li className="flex items-center gap-2 text-xs font-medium mb-3">
//               <div className="icon">
//                 <svg
//                   xmlns="http://www.w3.org/2000/svg"
//                   width="16"
//                   height="16"
//                   viewBox="0 0 16 16"
//                   fill="none"
//                 >
//                   <path
//                     d="M13.3334 4L6.00008 11.3333L2.66675 8"
//                     stroke="#465FF1"
//                     stroke-opacity="0.25"
//                     stroke-width="1.5"
//                     stroke-linecap="round"
//                     stroke-linejoin="round"
//                   />
//                 </svg>
//               </div>
//               <p>Contains a number or symbol</p>
//             </li>
//           </ul>
//         </div>
//         <div className="col-span-2 mt-12">
//             <button type="submit" className="block w-full text-base font-bold rounded-lg bg-[#6A1084] text-white py-3 px-20">Create Account</button>
//         </div>
//         <div className="col-span-2 mt-25 text-center">
//             <p className="text-[10px] text-[#9C9AA5]">By signing up to create an account I accept Company’s <br /> <strong className="font-bold italic text-[#26203B]">Terms of use & Privacy Policy.</strong></p>
//         </div>
//       </form>
//     </>
//   );
// }
"use client";
import Link from "next/link";
import { useState } from "react";

export default function RegisterForm() {
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const hasMinLength = password.length >= 8;
  const hasSymbolOrNumber = /[\d\W]/.test(password);
  const notContainNameOrEmail =
    !password.toLowerCase().includes(firstName.toLowerCase()) &&
    !password.toLowerCase().includes(email.toLowerCase());

  const strength =
    password.length >= 12 && hasSymbolOrNumber && notContainNameOrEmail
      ? "Strong"
      : hasMinLength
      ? "Medium"
      : "Weak";

  const checkIcon = (active: boolean) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
    >
      <path
        d="M13.3334 4L6.00008 11.3333L2.66675 8"
        stroke="#465FF1"
        strokeOpacity={active ? "1" : "0.25"}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  return (
    <form className="grid grid-cols-2 gap-x-4 max-w-[360px]">
      {/* First name */}
      <div className="col-span-1 mb-7">
        <label htmlFor="first_name" className="block text-base font-normal mb-2">
          First name
        </label>
        <input
          type="text"
          className="form-control"
          id="first_name"
          name="first_name"
          onChange={(e) => setFirstName(e.target.value)}
        />
      </div>

      {/* Last name */}
      <div className="col-span-1 mb-7">
        <label htmlFor="last_name" className="block text-base font-normal mb-2">
          Last name
        </label>
        <input type="text" className="form-control" id="last_name" name="last_name" />
      </div>

      {/* Email */}
      <div className="col-span-2 mb-7">
        <label htmlFor="email" className="block text-base font-normal mb-2">
          Email
        </label>
        <input
          type="email"
          className="form-control"
          id="email"
          name="email"
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      {/* Password */}
      <div className="col-span-2 mb-3">
        <label htmlFor="password" className="block text-base font-normal mb-2">
          Password
        </label>
        <input
          type="password"
          className="form-control"
          id="password"
          name="password"
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      {/* Password conditions */}
      <div className="col-span-2">
        <ul>
          <li className="flex items-center gap-2 text-xs font-medium mb-3">
            <div className="icon">{checkIcon(true)}</div>
            <p>Password Strength: {strength}</p>
          </li>
          <li className="flex items-center gap-2 text-xs font-medium mb-3">
            <div className="icon">{checkIcon(notContainNameOrEmail)}</div>
            <p>Cannot contain your name or email address</p>
          </li>
          <li className="flex items-center gap-2 text-xs font-medium mb-3">
            <div className="icon">{checkIcon(hasMinLength)}</div>
            <p>At least 8 characters</p>
          </li>
          <li className="flex items-center gap-2 text-xs font-medium mb-3">
            <div className="icon">{checkIcon(hasSymbolOrNumber)}</div>
            <p>Contains a number or symbol</p>
          </li>
        </ul>
      </div>

      {/* Submit button */}
      <div className="col-span-2 mt-12">
        <Link href={'/auth/selfie-policy'}
          className="block w-full text-base font-bold rounded-lg bg-[#6A1084] text-white py-3 px-20 text-center"
        >
          Create Account
        </Link>
      </div>

      {/* Terms */}
      <div className="col-span-2 mt-6 text-center">
        <p className="text-[10px] text-[#9C9AA5]">
          By signing up to create an account I accept Company’s <br />
          <strong className="font-bold italic text-[#26203B]">
            Terms of use & Privacy Policy.
          </strong>
        </p>
      </div>
    </form>
  );
}
