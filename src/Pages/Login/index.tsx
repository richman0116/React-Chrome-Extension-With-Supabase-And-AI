import { Dispatch, SetStateAction, useCallback, useState } from "react";
import { useForm } from "react-hook-form";

import FormLine from "../../components/FormLine";
import { Button } from "../../components/GeneralButton";
import ArrowBack from "../../components/ArrowBack.tsx";
import { Paths } from "../../utils/constants";

interface LoginFormData {
  email: string;
  password: string;
}

interface LoginInterface {
  setIsLoggedIn: Dispatch<SetStateAction<boolean>>
}

const Login = ({ setIsLoggedIn }: LoginInterface) => {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('')

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<LoginFormData>({});

  const handleSignIn = useCallback(
    (data: LoginFormData) => {
      try {
        setIsSubmitting(true);
        const { email, password } = data;
        chrome.runtime.sendMessage(
          {
            action: "loginWithEmailPassword",
            email,
            password,
          },
          (response) => {
            if (response.error) {
              console.log("response.error", response.error);
              setErrorMsg(response.error)
              setIsSubmitting(false);
            } else {
              console.log("response", response);
              if (response){
                // Kazuo: please have some notification system
                // so that when the password is wrong or anything
                // that make the response false, show a warning
                setErrorMsg('')
                setIsSubmitting(false);
                setIsLoggedIn(true)
              }else{
                // something is wrong that made the response falses
                setErrorMsg('Invalid login credentials')
                setIsSubmitting(false);
              }
            }
          }
        );
      } catch (ex) {
        console.log(ex, "kkkkkkkk");
      }
    },
    [setIsLoggedIn]
  );

  return (
    <div className="w-full h-full flex flex-col">
      <div className="w-full flex justify-end pb-8">
        <a
          href={Paths.SIGNUP}
          target="_blank"
          rel="noreferrer"
          className="flex w-25.5 justify-center border border-gray-300 rounded-md bg-gray-200 hover:bg-gray-300 text-sm font-medium text-gray-600 transition-all duration-300 gap-1 hover:gap-1.5 py-2"
        >
          Register
          <ArrowBack className="rotate-180" />
        </a>
      </div>
      <div className="flex flex-col gap-4 w-full border border-black/10 shadow-md hover:shadow-lg rounded-md px-4 py-8">
        <div className="flex flex-col items-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome to Eden</h2>
          <p className="text-lg font-semibold text-gray-500">Please log in</p>
        </div>
        <form onSubmit={handleSubmit(handleSignIn)} className="space-y-4">
          <FormLine
            title="Email:"
            id="email"
            type="email"
            error={errors.email?.message}
            {...register("email")}
            placeholder="Your email address here"
            required
            className="w-full p-2 border rounded-lg bg-white focus:border-blue-300 focus:ring focus:ring-blue-200"
          />
          <FormLine
            title="Password:"
            id="password"
            type="password"
            error={errors.password?.message}
            {...register("password")}
            placeholder="Your password here"
            required
            className="w-full p-2 border rounded-lg bg-white focus:border-blue-300 focus:ring focus:ring-blue-200"
          />
          <p className="text-base text-red-700">{errorMsg}</p>
          <div className="flex justify-center">
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Login"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
