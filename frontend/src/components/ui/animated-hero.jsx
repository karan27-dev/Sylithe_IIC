import { useEffect, useMemo, useState } from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { MoveRight, PhoneCall } from "lucide-react";
import { Button } from "./button";

function Hero() {
  const [titleNumber, setTitleNumber] = useState(0);
  const titles = useMemo(
    () => ["Climate action", "Trust", "Carbon Credits", "Verification"],
    []
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (titleNumber === titles.length - 1) {
        setTitleNumber(0);
      } else {
        setTitleNumber(titleNumber + 1);
      }
    }, 2000);
    return () => clearTimeout(timeoutId);
  }, [titleNumber, titles]);

  return (
    <div className="w-full">
      <div className="container mx-auto px-6 md:px-12 lg:px-16">
        <div className="flex gap-8 py-20 lg:py-40 items-center justify-center flex-col">
          <div>
            <Button variant="secondary" size="sm" className="gap-4">
              Read our launch article <MoveRight className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex gap-4 flex-col">
            <h1 className="text-4xl md:text-5xl lg:text-[4.5rem] font-bold text-[#0F172A] leading-[1.1] mb-6 tracking-tight text-center">
              The carbon intelligence <br className="hidden md:block" />
              platform enabling <br className="hidden md:block" />
              <span className="text-[#16a34a]">confident</span> <br />
              <span className="relative flex w-full justify-center overflow-hidden text-center md:pb-4 md:pt-1 text-[#16a34a]">
                &nbsp;
                {titles.map((title, index) =>
                  <motion.span
                    key={index}
                    className="absolute font-semibold"
                    initial={{ opacity: 0, y: "-100%" }}
                    transition={{ type: "spring", stiffness: 50 }}
                    animate={
                      titleNumber === index ?
                        {
                          y: 0,
                          opacity: 1
                        } :
                        {
                          y: titleNumber > index ? -150 : 150,
                          opacity: 0
                        }
                    }>

                    {title}
                  </motion.span>
                )}
              </span>
            </h1>

            <p className="text-lg md:text-xl leading-relaxed tracking-tight text-muted-foreground max-w-2xl text-center">
              Measure, reduce, and remove your carbon emissions with Sylithe's science-backed carbon management solutions.
            </p>
          </div>
          <div className="flex flex-row gap-3">
            <Button size="lg" className="gap-4" variant="outline">
              Jump on a call <PhoneCall className="w-4 h-4" />
            </Button>
            <Button size="lg" className="gap-4 bg-[#16a34a] text-[#064e3b] hover:bg-[#0F172A] hover:text-white transition-all shadow-lg active:scale-95">
              Sign up here <MoveRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>);

}

export { Hero };