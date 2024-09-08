import React, { createContext, useState, useContext, ReactNode } from "react";

interface AccelCourse {
	course_name: string;
	course_link: string;
	course_type: string;
}

interface AccelProgressStatus {
	progress_status: string;
}

interface AccelUserProgress {
	accel_course: AccelCourse;
	course_progress: AccelProgressStatus;
	complete_date: string | null;
	approve_date: string | null;
	comment: string | null;
	rating: string | null;
}

interface UserContextType {
	userProgress: AccelUserProgress[] | null;
	setUserProgress: (progress: AccelUserProgress[]) => void;
	userRole: string | null;
	setUserRole: (role: string | null) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({
	children,
}) => {
	const [userProgress, setUserProgress] = useState<AccelUserProgress[] | null>(
		null
	);
	const [userRole, setUserRole] = useState<string | null>(null);
	return (
		<UserContext.Provider
			value={{ userProgress, setUserProgress, userRole, setUserRole }}
		>
			{children}
		</UserContext.Provider>
	);
};

export const useUser = (): UserContextType => {
	const context = useContext(UserContext);
	//console.log("🚀 ~ useUser ~ context:", context);
	if (!context) {
		throw new Error("useUser must be used within a UserProvider");
	}
	return context;
};
