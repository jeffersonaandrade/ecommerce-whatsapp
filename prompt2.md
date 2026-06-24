You are given a task to integrate an existing React component in the codebase

The codebase should support:

shadcn project structure

Tailwind CSS

Typescript

If it doesn't, provide instructions on how to setup project via shadcn CLI, install Tailwind or Typescript.

Determine the default path for components and styles.If default path for components is not /components/ui, provide instructions on why it's important to create this folderCopy-paste this component to /components/ui folder:

product-reveal-card.tsx
"use client"

import { motion, useReducedMotion } from "framer-motion"
import { buttonVariants } from "@/components/ui/button"
import { ShoppingCart, Star, Heart } from "lucide-react"