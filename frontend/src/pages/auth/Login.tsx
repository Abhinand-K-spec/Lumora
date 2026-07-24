import LoginForm from "../../components/auth/LoginForm"
import RegisterHero from "../../components/auth/RegisterHero"


const Login = () => {
  return (
    <div className="min-h-screen bg-[#09090B]">
        <div className="mx-auto flex min-h-screen max-w-7xl">
            <RegisterHero/>
            <LoginForm/>
        </div>
    </div>
  )
}

export default Login
