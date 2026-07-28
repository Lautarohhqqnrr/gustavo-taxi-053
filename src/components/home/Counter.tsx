'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { SITE } from '@/lib/constants'

const stats = [
  { label: 'Años de experiencia', value: SITE.yearsExperience, suffix: '+' },
  { label: 'Clientes satisfechos', value: 2500, suffix: '+' },
  { label: 'Viajes realizados', value: 8000, suffix: '+' },
  { label: 'Destinos en Chubut', value: 40, suffix: '+' },
]

function AnimatedNumber({
  value,
  suffix,
}: {
  value: number
  suffix: string
}) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-50px' })

  useEffect(() => {
    if (!inView) return
    const duration = 1800
    const steps = 60
    const increment = value / steps
    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= value) {
        setCount(value)
        clearInterval(timer)
      } else {
        setCount(Math.floor(current))
      }
    }, duration / steps)
    return () => clearInterval(timer)
  }, [inView, value])

  return (
    <span ref={ref} className="tabular-nums">
      {count.toLocaleString('es-AR')}
      {suffix}
    </span>
  )
}

export function Counter() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.3, duration: 0.6 }}
      className="mx-auto grid max-w-3xl grid-cols-2 gap-6 sm:grid-cols-4"
    >
      {stats.map((stat) => (
        <div key={stat.label} className="text-center">
          <div className="text-2xl font-bold text-gold-400 sm:text-3xl">
            <AnimatedNumber value={stat.value} suffix={stat.suffix} />
          </div>
          <div className="mt-1 text-xs text-zinc-500 sm:text-sm">
            {stat.label}
          </div>
        </div>
      ))}
    </motion.div>
  )
}