import { services } from "../constants";
import { Service } from "../types";
import { useIntersect } from "../hooks/useIntersect";

const ServiceCard = ({ title, icon }: Service) => (
    <div className='motion-safe:animate-slideIn md:w-1/3 lg:w-1/5 rounded-[20px] py-5 px-12 min-h-[280px] flex justify-evenly items-center flex-col hover:bg-slate-800'>
        <img
            src={icon}
            alt={title}
            className='w-16 h-16 object-contain'
        />
        <h3 className='text-white text-[20px] font-bold text-center'>
            {title}
        </h3>
    </div>
);

export const About = () => {
    const [ref, isVisible] = useIntersect({ rootMargin: '-50px' });

    return (
        <div className='h-screen sm:px-16 px-6 mt-20'>
            <h2 className='section-head-text'>About</h2>
            <p className='mt-4 text-secondary text-[17px] max-w-3xl leading-[30px]'>
                I'm a skilled software developer with experience in TypeScript and
                JavaScript, and expertise in powerful technologies like React, Node.js, and
                Nest.js. I'm a quick learner and collaborate closely with business owners to
                create efficient, scalable, and user-friendly solutions that solve
                real-world problems.
            </p>
            <div className='flex flex-wrap gap-5 items-center justify-center mt-10' ref={c => ref.current = c}>
                {
                    isVisible && services.map(service => (
                        <ServiceCard key={service.title} {...service} />
                    ))
                }
            </div>
        </div>
    );
};
