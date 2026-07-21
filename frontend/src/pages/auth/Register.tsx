
import RegisterHero from '../../components/auth/RegisterHero'
import RegisterForm from '../../components/auth/RegisterForm'


const Register = () => {
  return (
    <div className="min-h-screen bg-[#09090B]">
        <div className="mx-auto flex min-h-screen max-w-7xl">
            <RegisterHero/>
            <RegisterForm/>
        </div>
    </div>
  )
}

export default Register
