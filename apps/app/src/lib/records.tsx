import { cn } from "./utils";
import { IconUsers, IconBuildingStore, IconBriefcase } from "@tabler/icons-react";

export const getRecordIcon = (type: string, className?: string) => {
    if (type === "contacts" || type === "contact" || type === "Contact") {
      return (
        <div className={cn('bg-indigo-700 p-1 rounded-sm', className)}>
          <IconUsers className='h-2 w-2 fill-white stroke-white stroke-0' />
        </div>
      )
    }
  
    if (type === "properties" || type === "property" || type === "Property") {
      return (
        <div className={cn('bg-orange-700 p-1 rounded-sm', className)}>
          <IconBuildingStore className='h-2 w-2 fill-white stroke-white stroke-0' />
        </div>
      )
    }
  
    if (type === "companies" || type === "company" || type === "Company") {
      return (
        <div className={cn('bg-purple-700 p-1 rounded-sm', className)}>
          <IconBriefcase className='h-2 w-2 fill-white stroke-white stroke-0' />
        </div>
      )
    }
  
    return null;
  }