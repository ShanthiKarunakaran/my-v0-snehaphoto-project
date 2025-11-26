"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface NavItem {
  name: string
  url: string
  icon: LucideIcon
}

interface NavBarProps {
  items: NavItem[]
  defaultActive?: string
}

export function AnimeNavBar({ items, defaultActive = "Home" }: NavBarProps) {
  const [mounted, setMounted] = useState(false)
  const [hoveredTab, setHoveredTab] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<string>(defaultActive)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      const sections = items
        .map((item) => {
          const element = document.querySelector(item.url)
          if (element) {
            const rect = element.getBoundingClientRect()
            return {
              name: item.name,
              top: rect.top,
              bottom: rect.bottom,
            }
          }
          return null
        })
        .filter(Boolean)

      const current = sections.find((section) => section && section.top <= 100 && section.bottom > 100)

      if (current) {
        setActiveTab(current.name)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [items])

  if (!mounted) return null

  return (
    <div className="fixed top-5 left-0 right-0 z-[9999]">
      <div className="flex justify-center pt-6">
        <motion.div
          className="flex items-center gap-3 bg-black/50 border border-white/10 backdrop-blur-lg py-2 px-2 rounded-full shadow-lg relative"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20,
          }}
        >
          {items.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.name
            const isHovered = hoveredTab === item.name

            return (
              <Link
                key={item.name}
                href={item.url}
                onClick={(e) => {
                  e.preventDefault()
                  setActiveTab(item.name)
                  document.querySelector(item.url)?.scrollIntoView({ behavior: "smooth" })
                }}
                onMouseEnter={() => setHoveredTab(item.name)}
                onMouseLeave={() => setHoveredTab(null)}
                className={cn(
                  "relative cursor-pointer text-sm font-semibold px-6 py-3 rounded-full transition-all duration-300",
                  "text-white/70 hover:text-white",
                  isActive && "text-white",
                )}
              >
                {isActive && (
                  <motion.div
                    className="absolute inset-0 rounded-full -z-10 overflow-hidden"
                    initial={{ opacity: 0 }}
                    animate={{
                      opacity: [0.3, 0.5, 0.3],
                      scale: [1, 1.03, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                    }}
                  >
                    <div className="absolute inset-0 bg-primary/25 rounded-full blur-md" />
                    <div className="absolute inset-[-4px] bg-primary/20 rounded-full blur-xl" />
                    <div className="absolute inset-[-8px] bg-primary/15 rounded-full blur-2xl" />
                    <div className="absolute inset-[-12px] bg-primary/5 rounded-full blur-3xl" />

                    <div
                      className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/20 to-primary/0"
                      style={{
                        animation: "shine 3s ease-in-out infinite",
                      }}
                    />
                  </motion.div>
                )}

                <motion.span
                  className="hidden md:inline relative z-10"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  {item.name}
                </motion.span>
                <motion.span className="md:hidden relative z-10" whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>
                  <Icon size={18} strokeWidth={2.5} />
                </motion.span>

                <AnimatePresence>
                  {isHovered && !isActive && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="absolute inset-0 bg-white/10 rounded-full -z-10"
                    />
                  )}
                </AnimatePresence>

                {isActive && (
                  <motion.div
                    layoutId="anime-mascot"
                    className="absolute -top-12 left-1/2 -translate-x-1/2 pointer-events-none"
                    initial={false}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 30,
                    }}
                  >
                    <div className="relative w-12 h-12">
                      {/* Camera body */}
                      <motion.div
                        className="absolute w-10 h-8 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg left-1/2 -translate-x-1/2 top-1"
                        animate={
                          hoveredTab
                            ? {
                                scale: [1, 1.1, 1],
                                rotate: [0, -5, 5, 0],
                                transition: {
                                  duration: 0.5,
                                  ease: "easeInOut",
                                },
                              }
                            : {
                                y: [0, -3, 0],
                                transition: {
                                  duration: 2,
                                  repeat: Number.POSITIVE_INFINITY,
                                  ease: "easeInOut",
                                },
                              }
                        }
                      >
                        {/* Camera lens */}
                        <motion.div
                          className="absolute w-5 h-5 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 border-2 border-gray-500"
                          animate={
                            hoveredTab
                              ? {
                                  scale: [1, 0.9, 1],
                                  transition: {
                                    duration: 0.3,
                                  },
                                }
                              : {}
                          }
                        >
                          {/* Lens center */}
                          <div className="absolute w-2 h-2 bg-blue-400 rounded-full left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
                        </motion.div>

                        {/* Flash */}
                        <motion.div
                          className="absolute w-2 h-1.5 bg-yellow-300 rounded-sm top-1 right-1"
                          animate={
                            hoveredTab
                              ? {
                                  opacity: [0.5, 1, 0.5],
                                  transition: {
                                    duration: 0.3,
                                    repeat: 2,
                                  },
                                }
                              : {
                                  opacity: 0.5,
                                }
                          }
                        />

                        {/* Viewfinder */}
                        <div className="absolute w-2 h-1.5 bg-gray-700 rounded-sm top-1 left-1" />

                        <AnimatePresence>
                          {hoveredTab && (
                            <>
                              <motion.div
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0 }}
                                className="absolute -top-1 -right-1 w-2 h-2 text-yellow-300"
                              >
                                ✨
                              </motion.div>
                              <motion.div
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0 }}
                                transition={{ delay: 0.1 }}
                                className="absolute -top-2 left-0 w-2 h-2 text-yellow-300"
                              >
                                ✨
                              </motion.div>
                            </>
                          )}
                        </AnimatePresence>
                      </motion.div>

                      {/* Camera strap/shadow */}
                      <motion.div
                        className="absolute -bottom-1 left-1/2 w-4 h-4 -translate-x-1/2"
                        animate={
                          hoveredTab
                            ? {
                                y: [0, -4, 0],
                                transition: {
                                  duration: 0.3,
                                  repeat: Number.POSITIVE_INFINITY,
                                  repeatType: "reverse",
                                },
                              }
                            : {
                                y: [0, 2, 0],
                                transition: {
                                  duration: 1,
                                  repeat: Number.POSITIVE_INFINITY,
                                  ease: "easeInOut",
                                  delay: 0.5,
                                },
                              }
                        }
                      >
                        <div className="w-full h-full bg-gray-800 rotate-45 transform origin-center" />
                      </motion.div>
                    </div>
                  </motion.div>
                )}
              </Link>
            )
          })}
        </motion.div>
      </div>
    </div>
  )
}
