import {
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import { Link } from "react-router-dom";
import loginImage from "../../../assets/loging-image.png";

const HomeScreen = () => {
  return (
    <main className="min-h-screen overflow-hidden bg-[#f5f8fc] text-slate-900">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 py-5 sm:px-8 lg:px-12">
        <header className="flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-3"
            aria-label="HRMS home"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-200">
              <ShieldCheck size={24} />
            </span>
            <span>
              <span className="block text-xl font-bold tracking-tight">
                HRMS
              </span>
              <span className="hidden text-xs text-slate-500 sm:block">
                Human Resource Management System
              </span>
            </span>
          </Link>
          <Link
            to="/login"
            className="hidden items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-blue-600 sm:flex"
          >
            Existing user? Sign in <ArrowRight size={16} />
          </Link>
        </header>

        <section className="grid flex-1 items-center gap-12 py-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20 lg:py-16">
          <div className="relative z-10">
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-blue-700 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              One place for better workdays
            </p>
            <h1 className="max-w-2xl text-4xl font-bold leading-[1.05] tracking-tight text-slate-950 sm:text-6xl">
              A clearer way to manage your people and your day.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
              HRMS brings attendance, leave, payroll, documents, and employee
              information into one secure workspace for every team.
            </p>

            <div className="mt-8 grid max-w-xl gap-3 sm:grid-cols-3">
              {["Live attendance", "Secure records", "Simple workflows"].map(
                (item) => (
                  <div
                    key={item}
                    className="flex items-center gap-2 text-sm font-medium text-slate-700"
                  >
                    <CheckCircle2
                      size={17}
                      className="shrink-0 text-emerald-600"
                    />
                    {item}
                  </div>
                ),
              )}
            </div>

            <div className="mt-10 grid max-w-2xl gap-4 sm:grid-cols-2">
              <AccessCard
                icon={BriefcaseBusiness}
                title="HR workspace"
                text="Create your company account and manage your team from one central dashboard."
                signIn="/hr-signin"
                signUp="/hr-signup"
                accent="blue"
              />
              <AccessCard
                icon={UsersRound}
                title="Employee portal"
                text="Track your attendance, leave, profile, documents, and everyday work details."
                signIn="/employee-signin"
                accent="emerald"
              />
            </div>
          </div>

          <div className="relative flex min-h-[390px] items-center justify-center overflow-hidden rounded-[2rem] bg-[#101c36] px-8 py-10 shadow-2xl shadow-slate-300/60 sm:min-h-[500px] lg:min-h-[580px]">
            <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-blue-500/30" />
            <div className="absolute -bottom-28 -left-24 h-80 w-80 rounded-full bg-cyan-400/15" />
            <div className="relative z-10 text-center">
              <img
                src={loginImage}
                alt="HRMS workspace"
                className="mx-auto w-full max-w-[350px] drop-shadow-2xl"
              />
              <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-300">
                Keep the workday moving with information that is easy to find
                and actions that are easy to complete.
              </p>
            </div>
          </div>
        </section>

        <footer className="flex flex-col gap-2 border-t border-slate-200 py-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} HRMS. All rights reserved.</span>
          <span>Secure access for authorized users</span>
        </footer>
      </div>
    </main>
  );
};

const AccessCard = ({ icon: Icon, title, text, signIn, signUp, accent }) => {
  const accentStyles =
    accent === "emerald"
      ? "bg-emerald-50 text-emerald-700"
      : "bg-blue-50 text-blue-700";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div
        className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl ${accentStyles}`}
      >
        <Icon size={20} />
      </div>
      <h2 className="text-lg font-bold text-slate-900">{title}</h2>
      <p className="mt-2 min-h-[72px] text-sm leading-6 text-slate-500">
        {text}
      </p>
      <div className="mt-4 flex items-center gap-4 text-sm font-semibold">
        <Link to={signIn} className="text-slate-700 hover:text-blue-600">
          Sign in
        </Link>
        {signUp ? (
          <Link
            to={signUp}
            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700"
          >
            Sign up <ArrowRight size={15} />
          </Link>
        ) : (
          <span className="text-xs font-medium text-slate-400">
            Account created by HR
          </span>
        )}
      </div>
    </div>
  );
};

export default HomeScreen;
