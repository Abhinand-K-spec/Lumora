import Input from "../common/Input";
import RoleSelector from "./RoleSelector";
import {Mail, Lock, User} from 'lucide-react';
import Button from '../../components/common/Button';
import { FcGoogle } from "react-icons/fc";
import { Link } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";

import {registerSchema, type RegisterFormData} from "../../schemas/auth/registerSchema";

import authService from "../../services/authService";
import axios from "axios";
import { toast } from "sonner";



const RegisterForm = () => {
    const {register,control,handleSubmit,getValues,formState: { errors },} = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
          name: "",
          email: "",
          password: "",
          confirmPassword: "",
          role: "USER",
        },
      });

      const navigate = useNavigate();

      const onSubmit = async(data: RegisterFormData) => {
    
        try {
            const response = await authService.register(data);
            toast.success(response.message);
            console.log(response.data);
            navigate('/verifyEmail',{state:{email:data.email,purpose:"register"},});
        } catch (error) {
            if(axios.isAxiosError(error)){
                toast.error(error.response?.data?.message)
            }else{
                toast.error('Something went wrong');
            }
        }
      };

    return (
      <div className="text-white flex w-1/2 items-center justify-center p-5">
  
        <div className="w-full space-y-5 max-w-xl rounded-2xl border border-[#2B2B2B] bg-[#171717] p-5 shadow-2xl">
  
        <div className="mb-10">
            <h1 className="font-heading text-5xl text-primary">
                Begin Your Journey
            </h1>

            <p className="mt-3 text-text-secondary">
                Create your account to unlock the Lumora experience.
            </p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)}>

        <Controller
            name="role"
            control={control}
            render={({ field }) => (
                <RoleSelector
                value={field.value}
                onChange={field.onChange}
                />
            )}
            />
          <Input label="Name" error={errors.name?.message} {...register('name')} type="text" placeholder="Your Name" icon={<User size={20}/>}/>
          <Input label="Email" error={errors.email?.message} {...register('email')}  placeholder="example@domain.com" icon={<Mail size={20}/>}/>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Input label="Password" error={errors.password?.message} {...register('password')} type="password" icon={<Lock size={20}/> }/>
            <Input label="confirm Password" error={errors.confirmPassword?.message} {...register('confirmPassword')} type="password" icon={<Lock size={20}/> }/>
          </div>
          <Button type='submit'>
              Creaet Account
          </Button>
          <div className="my-6 flex items-center">
            <div className="h-px flex-1 bg-border" />
                <span className="mx-4 text-sm text-text-secondary">OR</span>
            <div className="h-px flex-1 bg-border" />
          </div>
          <button
            type="button"
            onClick={() => {
              const role = getValues('role') || 'USER';
              window.location.href = `http://localhost:3000/api/auth/google?role=${role}`;
            }}
            className="
            flex
            w-full
            items-center
            justify-center
            gap-3
            rounded-xl
            border
            border-border
            bg-card
            py-3
            font-medium
            text-text
            transition
            hover:bg-neutral-800
            "
            >
            <FcGoogle size={22} />
                Continue with Google
            </button>
            <div className="mt-6 text-center">
                <p className="text-sm text-text-secondary">
                    Already have an account?{" "}
                    <Link
                        to="/login"
                        className="font-semibold text-primary transition hover:underline"
                        >
                        SIGN IN
                    </Link>
                </p>
            </div>
        </form>
        </div>
  
      </div>
    );
  };
  

export default RegisterForm
