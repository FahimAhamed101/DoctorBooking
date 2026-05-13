'use client'
import React from "react";
import { useGetProfileQuery } from '@/redux/features/auth/authApi';
import { useEffect } from "react";
import { checkAuth } from "./auth";
import { useDispatch } from "react-redux";

interface IChildren {
  children: React.ReactNode;
}


const AuthLayout = ({ children }: IChildren) => {

  const dispatch = useDispatch();
  const { refetch } = useGetProfileQuery();

  useEffect(() => {
    if (checkAuth()) {
      // If auth is valid, refresh the user profile
      refetch();
    }
  }, [dispatch, refetch]);

  return <main>{children}</main>;
};

export default AuthLayout;
