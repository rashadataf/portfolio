import { EarthModel } from './three_d';

export const Hero = () => {
    return (
        <section className='relative w-full h-screen mx-auto'>
            <div
                className='absolute inset-0 top-[120px] max-w-7xl mx-auto sm:px-16 px-6 flex flex-row items-start gap-5'
            >
                <div className='flex flex-col justify-center items-center mt-5'>
                    <div className='w-5 h-5 rounded-full bg-[#915EFF]' />
                    <div className='w-1 sm:h-80 h-40 line-gradient' />
                </div>

                <div>
                    <h1 className='font-black lg:text-[80px] sm:text-[60px] xs:text-[50px] text-[40px] lg:leading-[98px] mt-2 text-white'>
                        Hi, I'm <span className='text-[#915EFF]'>Rashad</span>
                    </h1>
                    <p className='text-[#dfd9ff] font-medium lg:text-[30px] sm:text-[26px] xs:text-[20px] text-[16px] lg:leading-[40px] mt-2 text-white-100'>
                        I do my best trying to build rubust, scalable, and useful software <br className='sm:block hidden' />
                        Having fun with what I am doing is something I like to do <br className='sm:block hidden' />
                        Getting feedback and notes from others is what makes me getting better <br className='sm:block hidden' />
                        Please feel free to reach out to me <br className='sm:block hidden' />
                        <a href='mailto:rashadattaf@gmail.com' className='mt-6 block w-56 relative z-40 bg-[#3688ff] hover:bg-gray-100 hover:text-black text-white font-semibold py-2 px-4 rounded text-center'>Let's have a chat</a>
                    </p>
                </div>
            </div>

            <EarthModel />

            <div className='hidden absolute xs:bottom-10 bottom-3 w-full short:flex justify-center items-center'>
                <a href='#about'>
                    <div className='w-[35px] h-[64px] rounded-3xl border-4 border-secondary flex justify-center items-start p-2'>
                        <div className='w-3 h-3 rounded-full bg-secondary mb-1 animate-bounce'>
                        </div>
                    </div>
                </a>
            </div>
        </section>
    );
};