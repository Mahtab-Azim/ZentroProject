"use client"

import { useState, useEffect } from 'react'

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  // فقط مقدار اولیه را در state ذخیره می‌کنیم
  const [storedValue, setStoredValue] = useState<T>(initialValue)

  // زمانی که کامپوننت mount می‌شود، مقدار را از localStorage می‌خوانیم
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const item = window.localStorage.getItem(key)
        if (item) {
          setStoredValue(JSON.parse(item))
        }
      }
    } catch (error) {
      console.log(error)
    }
  }, [key])

  // تابعی برای بروزرسانی هم state و هم localStorage
  const setValue = (value: T) => {
    try {
      setStoredValue(value)
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(value))
      }
    } catch (error) {
      console.log(error)
    }
  }

  return [storedValue, setValue]
}