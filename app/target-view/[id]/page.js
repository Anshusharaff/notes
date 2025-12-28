import { getSharedTarget } from '@/lib/api/targets';
import { Progress } from '@/components/ui/progress';
import React from 'react'

export const dynamic = 'force-dynamic';

const TargetView = async ({ params }) => {
    const { id } = await params
    const target = await getSharedTarget(id);

    if (!target) {
        return <div className='text-4xl font-bold flex justify-center items-center w-full h-[70vh]'>Target not found!</div>
    }

    return (
        <div className='max-w-4xl mx-auto p-6 space-y-6'>
            <div className='border rounded-lg p-6 space-y-4'>
                <h2 className='text-4xl font-bold'>{target.message}</h2>
                <div className='space-y-2 text-lg'>
                    <p><strong>Target Date:</strong> {target.date}</p>
                    <p><strong>Created At:</strong> {target.created_at}</p>
                    <p className='text-2xl'>
                        <span className="text-red-500 font-bold">{target.days} days</span> {target.hours} hours {target.minutes} minutes left
                    </p>
                </div>
                <div className='space-y-2'>
                    <p className='text-sm text-gray-500'>Progress: {target.progressPercentage}%</p>
                    <Progress value={target.progressPercentage} className="w-full h-3" />
                </div>
            </div>
        </div>
    )
}

export default TargetView
