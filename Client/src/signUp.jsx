"use client";

import { useState } from "react";
import { Field, Label, Switch } from "@headlessui/react";
import Header from "./components/Header";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


export default function SignUp() {
  const [agreed, setAgreed] = useState(false);
  const [isTeacher, setIsTeacher] = useState(true);
  const [loading, setLoading] = useState(false);
  const [teacherForm, setTeacherForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "",
  });

  const [studentForm, setStudentForm] = useState({
    fullname: "",
    enrollmentNo: "",
    email: "",
    division: "",
    password: "",
  });

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  //validate the fullname of the student
  const validateFullname = (fullname) => {
    const re = /^[a-zA-Z\s]+$/;
    return re.test(String(fullname).toLowerCase());
    };

    //password must be of atleast 6 character validation
    const validatePassword = (password) => {
      const re = /^[a-zA-Z0-9]{6,}$/;
      return re.test(String(password).toLowerCase());
      }


  const validatePhoneNumber = (phoneNumber) => {
    const re = /^[6-9]\d{9}$/;
    return re.test(String(phoneNumber));
  };
  // i also want the enrollement no to be checked
  const validateEnrollmentNo = (enrollmentNo) => {
    const re = /^[0-9]{6,10}$/;
    return re.test(String(enrollmentNo));
  };

  const handleTeacherChange = (e) => {
    setTeacherForm({
      ...teacherForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleStudentChange = (e) => {
    setStudentForm({
      ...studentForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agreed) {
      toast.error("Please agree to the privacy policy");
      return;
    }

    const form = isTeacher ? teacherForm : studentForm;

    if (isTeacher) {
      if (!form.firstName || !form.lastName || !form.email || !form.phoneNumber || !form.password) {
        toast.error("All fields are required");
        return;
      }
      if (!validateEmail(form.email)) {
        toast.error("Invalid email address");
        return;
      }
      if (!validatePhoneNumber(form.phoneNumber)) {
        toast.error("Invalid phone number");
        return;
      }
      if (!validateFullname(form.firstName)) {
        toast.error("Invalid first name");
        return;
      }
      if (!validateFullname(form.lastName)) {
        toast.error("Invalid last name");
        return;
        }
        if (!validatePassword(form.password)) {
          toast.error("Password must be of atleast 6 characters");
          return;
          }
    } else {
      if (!form.fullname || !form.enrollmentNo || !form.email || !form.division || !form.password) {
        toast.error("All fields are required");
        return;
      }
      if (!validateEmail(form.email)) {
        toast.error("Invalid email address");
        return;
      }
      if(!validateFullname(form.fullname)){
        toast.error("Invalid full name");
        return;
      }
      if (!validateEnrollmentNo(form.enrollmentNo)) {
        toast.error("Invalid enrollment number");
        return;
        }
      if (!validatePassword(form.password)) {
        toast.error("Password must be of atleast 6 characters");
        return;
        }
    }

    setLoading(true);
    try {
      const response = await fetch(
        isTeacher ? "http://localhost:4000/teacherSignup" : "http://localhost:4000/studentSignUp",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      const data = await response.json();

      if (data.success) {
        toast.success(data.message);
      } else {
        toast.error(data.message || "An error occurred during signup");
      }
    } catch (error) {
      toast.error("An error occurred during signup");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <ToastContainer />
      <div className="isolate bg-white px-6 py-24 sm:py-32 lg:px-8">
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-[-10rem] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[-20rem]"
        >
          <div
            style={{
              clipPath:
                "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
            }}
            className="relative left-1/2 -z-10 aspect-[1155/678] w-[36.125rem] max-w-none -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#fffff] to-green-600 opacity-30 sm:left-[calc(50%-40rem)] sm:w-[72.1875rem]"
          />
        </div>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-2xl xl:text-3xl text-green-600 poppins-semibold tracking-tight sm:text-5xl">
            {isTeacher ? "Teacher's Sign Up" : "Student's Sign Up"}
          </h2>
          <button
            onClick={() => setIsTeacher(!isTeacher)}
            className="mt-4 text-sm text-green-600 underline"
          >
            {isTeacher ? "Switch to Student Sign Up" : "Switch to Teacher Sign Up"}
          </button>
        </div>
        {/*
          create a toast for showing error messages
          */ }
        
        <form
          onSubmit={handleSubmit}
          className="mx-auto mt-14 xl:mt-8 max-w-xl sm:mt-20"
        >
          {isTeacher ? (
            <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="first-name"
                  className="block text-sm/6 poppins-semibold text-gray-900"
                >
                  First name
                </label>
                <div className="mt-2.5">
                  <input
                    id="firstname"
                    name="firstName"
                    type="text"
                    value={teacherForm.firstName}
                    onChange={handleTeacherChange}
                    autoComplete="given-name"
                    className="block w-full rounded-md bg-white px-3.5 py-2 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-green-600"
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="last-name"
                  className="block text-sm/6 poppins-semibold text-gray-900"
                >
                  Last name
                </label>
                <div className="mt-2.5">
                  <input
                    id="lastname"
                    name="lastName"
                    type="text"
                    value={teacherForm.lastName}
                    onChange={handleTeacherChange}
                    autoComplete="family-name"
                    className="block w-full rounded-md bg-white px-3.5 py-2 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-green-600"
                  />
                </div>
              </div>
              <div className="sm:col-span-2">
                <label
                  htmlFor="email"
                  className="block text-sm/6 poppins-semibold text-gray-900"
                >
                  Email
                </label>
                <div className="mt-2.5">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={teacherForm.email}
                    onChange={handleTeacherChange}
                    autoComplete="email"
                    className="block w-full rounded-md bg-white px-3.5 py-2 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-green-600"
                  />
                </div>
              </div>
              <div className="sm:col-span-2">
                <label
                  htmlFor="phoneNumber"
                  className="block text-sm/6 poppins-semibold text-gray-900"
                >
                  Phone number
                </label>
                <div className="mt-2.5">
                  <div className="flex rounded-md bg-white outline outline-1 -outline-offset-1 outline-gray-300 has-[input:focus-within]:outline has-[input:focus-within]:outline-2 has-[input:focus-within]:-outline-offset-2 has-[input:focus-within]:outline-green-600">
                    <div className="grid shrink-0 grid-cols-1 focus-within:relative">
                      <select
                        id="country"
                        name="country"
                        autoComplete="country"
                        aria-label="Country"
                        defaultValue={"IN"}
                        className="col-start-1 row-start-1 w-full appearance-none rounded-md py-2 pl-3.5 pr-7 text-base text-gray-500 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-green-600 sm:text-sm/6"
                      >
                        <option>IN</option>
                      </select>
                    </div>
                    <input
                      id="phoneNumber"
                      name="phoneNumber"
                      type="text"
                      value={teacherForm.phoneNumber}
                      onChange={handleTeacherChange}
                      placeholder="+91 "
                      className="block min-w-0 grow py-1.5 pl-1 pr-3 text-base text-gray-900 placeholder:text-gray-400 focus:outline focus:outline-0 sm:text-sm/6"
                    />
                  </div>
                </div>
              </div>
              <div className="sm:col-span-2">
                <label
                  htmlFor="password"
                  className="block text-sm/6 poppins-semibold text-gray-900"
                >
                  Password
                </label>
                <div className="mt-2.5">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={teacherForm.password}
                    onChange={handleTeacherChange}
                    autoComplete="new-password"
                    className="block w-full rounded-md bg-white px-3.5 py-2 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-green-600"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label
                  htmlFor="full-name"
                  className="block text-sm/6 poppins-semibold text-gray-900"
                >
                  Full name
                </label>
                <div className="mt-2.5">
                  <input
                    id="fullname"
                    name="fullname"
                    type="text"
                    value={studentForm.fullname}
                    onChange={handleStudentChange}
                    autoComplete="name"
                    className="block w-full rounded-md bg-white px-3.5 py-2 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-green-600"
                  />
                </div>
              </div>
              <div className="sm:col-span-2">
                <label
                  htmlFor="enrollment-no"
                  className="block text-sm/6 poppins-semibold text-gray-900"
                >
                  Enrollment No
                </label>
                <div className="mt-2.5">
                  <input
                    id="enrollmentNo"
                    name="enrollmentNo"
                    type="text"
                    value={studentForm.enrollmentNo}
                    onChange={handleStudentChange}
                    autoComplete="off"
                    className="block w-full rounded-md bg-white px-3.5 py-2 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-green-600"
                  />
                </div>
              </div>
              <div className="sm:col-span-2">
                <label
                  htmlFor="email"
                  className="block text-sm/6 poppins-semibold text-gray-900"
                >
                  Email
                </label>
                <div className="mt-2.5">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={studentForm.email}
                    onChange={handleStudentChange}
                    autoComplete="email"
                    className="block w-full rounded-md bg-white px-3.5 py-2 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-green-600"
                  />
                </div>
              </div>
              <div className="sm:col-span-2">
                <label
                  htmlFor="division"
                  className="block text-sm/6 poppins-semibold text-gray-900"
                >
                  Division
                </label>
                <div className="mt-2.5">
                  <input
                    id="division"
                    name="division"
                    type="text"
                    value={studentForm.division}
                    onChange={handleStudentChange}
                    autoComplete="off"
                    className="block w-full rounded-md bg-white px-3.5 py-2 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-green-600"
                  />
                </div>
              </div>
              <div className="sm:col-span-2">
                <label
                  htmlFor="password"
                  className="block text-sm/6 poppins-semibold text-gray-900"
                >
                  Password
                </label>
                <div className="mt-2.5">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={studentForm.password}
                    onChange={handleStudentChange}
                    autoComplete="new-password"
                    className="block w-full rounded-md bg-white px-3.5 py-2 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-green-600"
                  />
                </div>
              </div>
            </div>
          )}
          <Field className="flex gap-x-4 sm:col-span-2 mt-6">
            <div className="flex h-6 items-center">
              <Switch
                checked={agreed}
                onChange={setAgreed}
                className="group flex w-8 flex-none cursor-pointer rounded-full bg-gray-200 p-px ring-1 ring-inset ring-gray-900/5 transition-colors duration-200 ease-in-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 data-[checked]:bg-green-600"
              >
                <span className="sr-only">Agree to policies</span>
                <span
                  aria-hidden="true"
                  className="size-4 transform rounded-full bg-white shadow-sm ring-1 ring-gray-900/5 transition duration-200 ease-in-out group-data-[checked]:translate-x-3.5"
                />
              </Switch>
            </div>
            <Label className="text-sm/6 poppins-regular text-gray-600">
              By selecting this, you agree to our{" "}
              <a href="#" className="poppins-semibold text-green-600">
                privacy&nbsp;policy
              </a>
              .
            </Label>
          </Field>
          <div className="mt-10">
          <button
  type="submit"
  disabled={loading || !agreed}
  className={`block w-full rounded-md px-3.5 py-2.5 text-center text-sm poppins-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 ${
    loading || !agreed
      ? "bg-gray-400 cursor-not-allowed"
      : "bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
  }`}
>
  {loading ? "Signing up..." : "Sign Up"}
</button>
          </div>
        </form>
      </div>
    </>
  );
}