'use client'

import React from 'react'
import { AgentInterface } from '@/components/AgentInterface'

export default function AgentPage() {
    return (
        <AgentInterface
            initialIsOpen={true}
            defaultFullscreen={true}
            hideTrigger={true}
        />
    )
}