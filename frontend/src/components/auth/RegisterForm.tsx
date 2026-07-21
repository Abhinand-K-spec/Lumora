import Input from "../common/Input";
import FormHeader from "./FormHeader";
import RoleSelector from "./RoleSelector";
import {Mail, Lock, User} from 'lucide-react'

const RegisterForm = () => {
    return (
      <div className="text-white flex w-1/2 items-center justify-center p-10">
  
        <div className="w-full space-y-5 max-w-xl rounded-2xl border border-[#2B2B2B] bg-[#171717] p-4 shadow-2xl">
  
          <FormHeader/>
          <RoleSelector/>
          <Input label="Name" type="text" placeholder="Your Name" icon={<User size={20}/>}/>
          <Input label="Email" type="email" placeholder="example@domain.com" icon={<Mail size={20}/>}/>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Input label="Password" type="password" icon={<Lock size={20}/> }/>
            <Input label="confirm Password" type="password" icon={<Lock size={20}/> }/>
          </div>
        </div>
  
      </div>
    );
  };
  

export default RegisterForm
