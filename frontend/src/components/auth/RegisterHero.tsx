import Logo from "../common/Logo";

const RegisterHero = () => {
  return (
    <div className="flex w-1/2 flex-col justify-center px-16">
      {/* Logo */}
      <h2 id="register_logo" className="text-3xl font-bold">
        <Logo />
      </h2>

      {/* Heading */}
      <h1
        id="hero_caption"
        className="text-primary mt-12 text-5xl font-bold leading-tight"
      >
        Presenting the
        <br />
        Essense of
        <br />
        Every Frame.
      </h1>

      {/* Description */}
      <p className="mt-6 max-w-md text-gray-400">
        Join an elite community where artistry meets enterprise. Discover a
        sanctuary for visual storytellers and those who cherish the
        extraordinary.
      </p>
    </div>
  );
};

export default RegisterHero;
