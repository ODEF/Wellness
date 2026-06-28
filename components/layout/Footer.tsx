import img from "next/image";

export default function Footer() {
  return (
    <footer className="flex w-full flex-row flex-wrap items-center justify-center gap-y-6 gap-x-12 border-t border-blue-gray-50 py-6 text-center md:justify-between">
        
        {/* 
        *
        *------------------------------------ RIGHT ------------------------------------
        * 
        */}

        <div className="right flex w-full flex-col items-center gap-y-6 md:flex-row md:justify-between md:gap-y-0">
           
          <p className="text-sm text-blue-gray-500">
            &copy; 2024 Healthy Paw. All rights reserved.
          </p>
        </div>
        
        {/* 
        *
        *------------------------------------ Middle ------------------------------------
        * 
        */}

        <div className="center flex w-full flex-col items-center gap-y-6 md:flex-row md:justify-between md:gap-y-0">
          <p className="text-sm text-blue-gray-500">
            <a href="/contact" className="text-blue-gray-500 hover:text-blue-gray-700">Contact Us</a> | <a href="/about" className="text-blue-gray-500 hover:text-blue-gray-700">About Us</a>
          </p>
        </div>

        {/* 
        *
        *------------------------------------ LEFT ------------------------------------
        * 
        */}
        <div className="left flex w-full flex-col items-center gap-y-6 md:flex-row md:justify-between md:gap-y-0">
          <p className="text-sm text-blue-gray-500">
            <a href="/privacy-policy" className="text-blue-gray-500 hover:text-blue-gray-700">  
Privacy Policy</a> | <a href="/terms-of-service" className="text-blue-gray-500 hover:text-blue-gray-700">Terms of Service</a>
            </p>
        </div>
    </footer>
  );
}
