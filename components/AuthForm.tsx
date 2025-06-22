'use client'

import React from 'react'
import {z} from 'zod'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

import { Button } from "@/components/ui/button"
import Image from 'next/image'
import Link from 'next/link'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { createUserWithEmailAndPassword , signInWithEmailAndPassword} from 'firebase/auth'
import { auth } from '@/firebase/client'
import { signIn, signUp } from '@/lib/actions/auth.action'



const authFormSchema = (type: FormType) => {
  return z.object({
    name: type==='sign-up'
      ? z.string().min(3, { message: "Name must be at least 3 characters long" })
      : z.string().optional(),
    email: z.string()
      .min(1, { message: "Email is required" })
      .email({ message: "Please enter a valid email address" }),
    password: z.string()
      .min(6, { message: "Password must be at least 6 characters long" })
      .max(100, { message: "Password cannot exceed 100 characters" }),
  })
}

const AuthForm = ({type}:{type:FormType}) => {

  const router = useRouter()

  const formSchema= authFormSchema(type) 

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  })
 
  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    try{
      if(type==='sign-up'){
        const {name , email , password} = values;
        const userCredentials = await createUserWithEmailAndPassword(auth ,email ,password )

        const result = await signUp({
          uid  : userCredentials.user.uid,
          name : name!,
          email,
          password
        })

        if(!result?.success){
          toast.error(result?.message);
          return
        }

        
        toast.success("Account created successfully . Please sign in.");
        router.push('/sign-in')
      }
      else{

        const {email , password} = values;
        const userCredential = await signInWithEmailAndPassword(auth , email , password);

        const idToken = await userCredential.user.getIdToken();

        if(!idToken){
          toast.error("Sign In Failed");
          return;
        }

        await signIn({email , idToken})

        toast.success("Sign in successfully .");
        router.push('/')
      }
    }
    catch(err){
      console.log(err) 
      toast.error(`There was an error: ${err}`)
    }
  }

  const isSignIn = type=== 'sign-in'

  return (


    <div className="card-border lg:min-w-[566px]">
      <div className="flex flex-col gap-6 card py-14 px-10" >
        <div className="flex flex-row gap-2 justify-center" >
          <Image src="/logo.svg" alt="logo" height={32} width={38} />

          <h2 className="text-primary-100" >PrepWise</h2>
        </div>

        <h3>Practice job interviews with AI</h3>
      
        <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6 mt-4 form">
          
          {!isSignIn && <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input type="text" placeholder="Your name" className='input' {...field} />
                </FormControl>

                <FormMessage />   
              </FormItem>   
            )}
          />}
          
          <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="Your email address" className='input' {...field} />
                </FormControl>

                <FormMessage />   
              </FormItem>   
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Enter your password" className='input' {...field} />
                  </FormControl>

                  <FormMessage />   
                </FormItem>   
              )}
          />

          <Button className="btn" type="submit">{isSignIn ? "Sign in":"Create an Account"}</Button>
        </form>
        </Form>

        <p className='text-center' >
          {isSignIn ? "Don't have an account ?" : "Already have an account?"}
          <Link href={!isSignIn ? '/sign-in':'sign-up'} className='font-bold text-user-primary ml-1' >{!isSignIn ? "Sign in":"Sign up"}</Link>
        </p>

      </div>
    </div>
  )
}

export default AuthForm