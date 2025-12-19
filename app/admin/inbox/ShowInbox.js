"use client"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useState } from "react";
import ShowInboxMessages from "./ShowData";

const ShowInbox = ({ result, filter }) => {
    const [data, setdata] = useState(result);

    const handleFilter = async (e) => {
        try {
            const response = await fetch(`/api/notifications?filter=${encodeURIComponent(e)}`, { cache: 'no-store' });
            const result = await response.json();
            setdata(result[0]);
        } catch (error) {
            console.error('Error filtering notifications:', error);
        }
    }
    return (
        <div>
            <p className="text-5xl text-center mb-4">Inbox</p>
            <div className="h-full w-full md:w-2/3 mx-auto rounded-2xl border border-gray-700 px-6 py-8">
                <div className="w-full flex items-center justify-end">
                    <Select onValueChange={handleFilter}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filter by" />
                        </SelectTrigger>
                        <SelectContent>
                            {
                                filter && filter.map((i, index) => {
                                    return (
                                        <SelectItem key={index} value={i.category}>{i.label}</SelectItem>
                                    )
                                })
                            }
                        </SelectContent>
                    </Select>
                </div>
                <ShowInboxMessages data={data} />
            </div>
        </div>
    )
}

export default ShowInbox