'use client'

import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'

interface Option {
    value: string | number
    label: string
}

interface CustomSelectProps {
    value: string | number
    onChange: (value: string | number) => void
    options: Option[]
    placeholder?: string
    className?: string
    disabled?: boolean
}

export function CustomSelect({
    value,
    onChange,
    options,
    placeholder = 'Select option',
    className = '',
    disabled = false
}: CustomSelectProps) {
    const [isOpen, setIsOpen] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    const selectedOption = options.find(opt => opt.value === value)

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleSelect = (optionValue: string | number) => {
        onChange(optionValue)
        setIsOpen(false)
    }

    return (
        <div className={`relative ${className}`} ref={containerRef}>
            <button
                type="button"
                onClick={() => !disabled && setIsOpen(!isOpen)}
                className={`w-full px-4 py-3 flex items-center justify-between border border-border bg-background text-foreground rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/60 transition-all ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                    }`}
            >
                <span className={selectedOption ? 'text-foreground' : 'text-muted-foreground'}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <ChevronDown
                    size={16}
                    className={`text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''
                        }`}
                />
            </button>

            {isOpen && (
                <div className="absolute z-50 w-full mt-2 bg-popover border border-border rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                    <div className="max-h-60 overflow-y-auto py-1">
                        {options.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => handleSelect(option.value)}
                                className={`w-full px-4 py-2.5 text-right flex items-center justify-between hover:bg-muted/50 transition-colors ${option.value === value ? 'bg-primary/10 text-primary font-medium' : 'text-foreground'
                                    }`}
                            >
                                <span>{option.label}</span>
                                {option.value === value && <Check size={16} className="text-primary" />}
                            </button>
                        ))}
                        {options.length === 0 && (
                            <div className="px-4 py-3 text-sm text-muted-foreground text-center">
                                موردی یافت نشد
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
