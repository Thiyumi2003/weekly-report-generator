import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Input from '../components/Input';
import Button from '../components/Button';
import Card from '../components/Card';
import { FiAlertTriangle, FiHome } from 'react-icons/fi';

const Register = () => {
  const { register: authRegister } = useAuth();
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: 'Team Member'
    }
  });

  const onSubmit = async (data) => {
    setErrorMsg('');
    setIsSubmitting(true);
    const result = await authRegister(data.name, data.email, data.password, 'Team Member');
    setIsSubmitting(false);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setErrorMsg(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-4 relative">
      <div className="absolute top-0 left-0 w-full h-full bg-radial from-indigo-950/20 via-transparent to-transparent pointer-events-none" />

      {/* Back to Home Button */}
      <Link
        to="/"
        className="absolute top-6 left-6 inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-slate-400 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-lg shadow-sm transition-all"
      >
        <FiHome className="h-4 w-4" />
        <span>Back to Home</span>
      </Link>

      {/* Header Logo */}
      <div className="flex items-center gap-2.5 mb-8">
        <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <span className="font-extrabold text-white text-xl">T</span>
        </div>
        <span className="text-2xl font-bold tracking-tight text-white font-serif">
          TeamPulse
        </span>
      </div>

      <div className="w-full max-w-md">
        <Card
          title="Create Account"
          subtitle="Register an account as a Team Member"
        >
          {errorMsg && (
            <div className="mb-4 bg-rose-950/40 border border-rose-900/60 p-3 rounded-lg flex items-start gap-2.5 text-xs text-rose-300">
              <FiAlertTriangle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              placeholder="e.g. your name"
              error={errors.name?.message}
              {...register('name', {
                required: 'Name is required',
                maxLength: {
                  value: 50,
                  message: 'Name cannot exceed 50 characters'
                }
              })}
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="e.g. you@gmail.com"
              error={errors.email?.message}
              {...register('email', {
                required: 'Email address is required',
                pattern: {
                  value: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                  message: 'Please enter a valid email address'
                }
              })}
            />

            <Input
              label="Password"
              type="password"
              placeholder="Min. 6 characters"
              error={errors.password?.message}
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters long'
                }
              })}
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full py-2.5 mt-2"
              loading={isSubmitting}
            >
              Sign Up
            </Button>
          </form>
        </Card>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
