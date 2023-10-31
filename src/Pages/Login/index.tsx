import { useCallback, useContext, useState } from "react";
import { useForm } from "react-hook-form";

import AuthContext from "../../contexts/AuthContext";
import FormLine from "../../components/FormLine";

import { extensionId } from "../../utils/constants";

interface LoginFormData {
  email: string;
  password: string;
}

const Login = () => {
  const { setIsLoggedIn } = useContext(AuthContext);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<LoginFormData>({});

  const handleSignIn = useCallback(
    (data: LoginFormData) => {
      setIsSubmitting(true);
      const { email, password } = data;
      chrome.runtime.sendMessage(
        extensionId,
        {
          action: "loginWithEmailPassword",
          email,
          password,
        },
        (response) => {
          console.log("We are here");
          if (response.error) {
            console.log("response.error", response.error);
            setIsLoggedIn(false);
            setIsSubmitting(false);
          } else {
            console.log("response", response);
            setIsLoggedIn(response);
            setIsSubmitting(false);
          }
        }
      );
    },
    [setIsLoggedIn]
  );

  return (
    <div className=" w-5/6 bg-cream p-8 rounded-lg shadow-md">
      <div className="flex flex-col items-center">
        <p className="text-2xl font-bold text-gray-800 mb-2">Welcome to Eden</p>
        <p className="text-lg text-gray-700">Please log in</p>
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
        <div className="flex justify-center">
          <button
            type="submit"
            className="px-6 py-2 rounded-lg font-semibold text-white bg-gold hover:bg-gold-dark transition duration-300 ease-in-out"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Login"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Login;
