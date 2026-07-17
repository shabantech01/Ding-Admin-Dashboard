import logo from "../assets/logo.png"
import { useForm } from "react-hook-form"

const Login = () => {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm()

    const onSubmit = async (data) => {
        console.log(data)
    }

    return (
        <div className="flex flex-col items-center w-full min-h-screen gap-10 sm:gap-14 md:gap-[75px] px-6 sm:px-10 md:px-16 lg:px-[200px] py-8 sm:py-10 md:py-[50px]">
            <img
                src={logo}
                alt="Ding logo"
                className="w-40 sm:w-56 md:w-[368px] h-auto"
            />

            <form
                onSubmit={handleSubmit(onSubmit)}
                className="flex flex-col gap-8 sm:gap-10 md:gap-[50px] w-full max-w-md md:max-w-none"
            >
                <div className="flex flex-col gap-3">
                    <p className="text-[#000000] text-xl sm:text-2xl font-bold">Login</p>
                    <p className="text-[#112211] text-sm sm:text-base font-normal">
                        Login to access your Ding account
                    </p>
                </div>

                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <label htmlFor="email" className="text-sm sm:text-base">Email</label>
                        <input
                            id="email"
                            type="email"
                            placeholder="Enter your email"
                            autoComplete="email"
                            className="w-full h-12 p-3 bg-[#F9F9F9] border border-[#D9D9D9] rounded-md text-sm sm:text-base"
                            {...register("email", {
                                required: "Email is required",
                                pattern: {
                                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                    message: "Enter a valid email address",
                                },
                            })}
                        />
                        {errors.email && (
                            <span className="text-red-500 text-xs">{errors.email.message}</span>
                        )}
                    </div>

                    <div className="flex flex-col gap-2">
                        <label htmlFor="password" className="text-sm sm:text-base">Password</label>
                        <input
                            id="password"
                            type="password"
                            placeholder="Enter your password"
                            autoComplete="current-password"
                            className="w-full h-12 p-3 bg-[#F9F9F9] border border-[#D9D9D9] rounded-md text-sm sm:text-base"
                            {...register("password", {
                                required: "Password is required",
                                minLength: {
                                    value: 6,
                                    message: "Password must be at least 6 characters",
                                },
                            })}
                        />
                        {errors.password && (
                            <span className="text-red-500 text-xs">{errors.password.message}</span>
                        )}
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-[#765AB8] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer w-full rounded-lg text-white font-semibold h-12 transition-opacity"
                >
                    {isSubmitting ? "Logging in..." : "Login"}
                </button>
            </form>
        </div>
    )
}

export default Login