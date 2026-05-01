import svgPaths from "./svg-uv687pkutz";
import imgProduct4 from "./38578013390fbffc5b1b33099f18242c6aaf9071.png";
import imgProduct3 from "./3fab88a9e64f25a4855a5c90d19743e943a790f9.png";
import imgProduct2 from "./614453ef068eb58d25fd4f9e006121cffd52fcae.png";
import imgProduct1 from "./f6694b845970a6c9f1f73259156265e2c4c85103.png";
import imgProfile from "./1406be1bb3e531935af8e5cf6bc014fde3dbc82c.png";

function Product1() {
  return <div className="-translate-x-1/2 -translate-y-1/2 absolute h-[265px] left-1/2 top-1/2 w-[157px]" data-name="Product 2" />;
}

function Product4() {
  return (
    <div className="-translate-x-1/2 absolute bottom-0 h-[302px] left-[calc(50%-0.5px)] w-[220px]" data-name="Product 4">
      <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgProduct4} />
    </div>
  );
}

function Heart() {
  return (
    <div className="absolute bg-[#292526] right-[14px] rounded-[32px] size-[24px] top-[14px]" data-name="heart">
      <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 size-[16px] top-1/2" data-name="Main Icon">
        <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
          <g id="heart">
            <path d={svgPaths.p2c744500} fill="var(--fill-0, #FDFDFD)" id="Vector" />
            <path d="M16 0H0V16H16V0Z" fill="var(--fill-0, #FDFDFD)" id="Vector_2" opacity="0" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Image() {
  return (
    <div className="h-[251px] overflow-clip relative rounded-[16px] shrink-0 w-[155px]" data-name="Image">
      <Product1 />
      <Product4 />
      <Heart />
    </div>
  );
}

function Text1() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-start leading-[1.5] relative shrink-0 whitespace-nowrap" data-name="Text">
      <p className="font-['Encode_Sans:SemiBold',sans-serif] font-semibold relative shrink-0 text-[#121111] text-[14px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        Light Dress Yellow
      </p>
      <p className="font-['Encode_Sans:Regular',sans-serif] font-normal relative shrink-0 text-[#787676] text-[10px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        Dress Modern
      </p>
    </div>
  );
}

function Review() {
  return (
    <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="Review">
      <div className="overflow-clip relative shrink-0 size-[18px]" data-name="Default Icon">
        <div className="absolute inset-[6.67%_8.65%_14.35%_8.64%]" data-name="Vector">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14.8878 14.2171">
            <path d={svgPaths.p1a321100} fill="var(--fill-0, #FFD33C)" id="Vector" />
          </svg>
        </div>
      </div>
      <p className="font-['Encode_Sans:Regular',sans-serif] font-normal leading-[1.5] relative shrink-0 text-[#292526] text-[12px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        5.0
      </p>
    </div>
  );
}

function Price() {
  return (
    <div className="content-stretch flex gap-[24px] items-center relative shrink-0" data-name="Price">
      <p className="font-['Encode_Sans:SemiBold',sans-serif] font-semibold leading-[1.5] relative shrink-0 text-[#292526] text-[14px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        $122.99
      </p>
      <Review />
    </div>
  );
}

function Text() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0" data-name="Text">
      <Text1 />
      <Price />
    </div>
  );
}

function Product3() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[8px] items-start left-[calc(50%+8.5px)] top-[624px]" data-name="Product 4">
      <Image />
      <Text />
    </div>
  );
}

function Heart1() {
  return (
    <div className="absolute bg-[#292526] left-[115px] rounded-[32px] size-[24px] top-[16px]" data-name="heart">
      <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 size-[16px] top-1/2" data-name="Main Icon">
        <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
          <g id="heart">
            <path d={svgPaths.p2c744500} fill="var(--fill-0, #FDFDFD)" id="Vector" />
            <path d="M16 0H0V16H16V0Z" fill="var(--fill-0, #FDFDFD)" id="Vector_2" opacity="0" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Product5() {
  return (
    <div className="-translate-x-1/2 -translate-y-1/2 absolute h-[221px] left-[calc(50%-0.5px)] top-1/2 w-[162px]" data-name="Product 3">
      <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgProduct3} />
    </div>
  );
}

function Heart2() {
  return (
    <div className="absolute bg-[#292526] left-[117px] rounded-[32px] size-[24px] top-[14px]" data-name="heart">
      <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 size-[16px] top-1/2" data-name="Main Icon">
        <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
          <g id="heart">
            <path d={svgPaths.p2c744500} fill="var(--fill-0, #FDFDFD)" id="Vector" />
            <path d="M16 0H0V16H16V0Z" fill="var(--fill-0, #FDFDFD)" id="Vector_2" opacity="0" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Image1() {
  return (
    <div className="h-[217px] overflow-clip relative rounded-[16px] shrink-0 w-[155px]" data-name="Image">
      <Heart1 />
      <Product5 />
      <Heart2 />
    </div>
  );
}

function Text3() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-start leading-[1.5] relative shrink-0 whitespace-nowrap" data-name="Text">
      <p className="font-['Encode_Sans:SemiBold',sans-serif] font-semibold relative shrink-0 text-[#121111] text-[14px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        Maroon Dark Top
      </p>
      <p className="font-['Encode_Sans:Regular',sans-serif] font-normal relative shrink-0 text-[#787676] text-[10px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        Dress
      </p>
    </div>
  );
}

function Review1() {
  return (
    <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="Review">
      <div className="overflow-clip relative shrink-0 size-[18px]" data-name="Default Icon">
        <div className="absolute inset-[6.67%_8.65%_14.35%_8.64%]" data-name="Vector">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14.8878 14.2171">
            <path d={svgPaths.p1a321100} fill="var(--fill-0, #FFD33C)" id="Vector" />
          </svg>
        </div>
      </div>
      <p className="font-['Encode_Sans:Regular',sans-serif] font-normal leading-[1.5] relative shrink-0 text-[#292526] text-[12px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        5.0
      </p>
    </div>
  );
}

function Price1() {
  return (
    <div className="content-stretch flex gap-[24px] items-center relative shrink-0" data-name="Price">
      <p className="font-['Encode_Sans:SemiBold',sans-serif] font-semibold leading-[1.5] relative shrink-0 text-[#292526] text-[14px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        $194.99
      </p>
      <Review1 />
    </div>
  );
}

function Text2() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0" data-name="Text">
      <Text3 />
      <Price1 />
    </div>
  );
}

function Product2() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[8px] items-start left-[24px] top-[590px]" data-name="Product 3">
      <Image1 />
      <Text2 />
    </div>
  );
}

function Product7() {
  return (
    <div className="-translate-x-1/2 -translate-y-1/2 absolute h-[265px] left-1/2 top-1/2 w-[157px]" data-name="Product 2">
      <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgProduct2} />
    </div>
  );
}

function Heart4() {
  return (
    <div className="absolute inset-[16.67%]" data-name="heart">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="heart">
          <path d={svgPaths.p219d2080} fill="var(--fill-0, white)" id="Vector" />
          <g id="Vector_2" opacity="0" />
        </g>
      </svg>
    </div>
  );
}

function Heart3() {
  return (
    <div className="absolute bg-[#292526] right-[14px] rounded-[32px] size-[24px] top-[14px]" data-name="heart">
      <Heart4 />
    </div>
  );
}

function Image2() {
  return (
    <div className="h-[251px] overflow-clip relative rounded-[16px] shrink-0 w-[155px]" data-name="Image">
      <Product7 />
      <Heart3 />
    </div>
  );
}

function Text5() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-start leading-[1.5] relative shrink-0 whitespace-nowrap" data-name="Text">
      <p className="font-['Encode_Sans:SemiBold',sans-serif] font-semibold relative shrink-0 text-[#121111] text-[14px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        Light Dress Bless
      </p>
      <p className="font-['Encode_Sans:Regular',sans-serif] font-normal relative shrink-0 text-[#787676] text-[10px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        Dress modern
      </p>
    </div>
  );
}

function Review2() {
  return (
    <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="Review">
      <div className="overflow-clip relative shrink-0 size-[18px]" data-name="Default Icon">
        <div className="absolute inset-[6.67%_8.65%_14.35%_8.64%]" data-name="Vector">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14.8878 14.2171">
            <path d={svgPaths.p1a321100} fill="var(--fill-0, #FFD33C)" id="Vector" />
          </svg>
        </div>
      </div>
      <p className="font-['Encode_Sans:Regular',sans-serif] font-normal leading-[1.5] relative shrink-0 text-[#292526] text-[12px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        5.0
      </p>
    </div>
  );
}

function Price2() {
  return (
    <div className="content-stretch flex gap-[24px] items-center relative shrink-0" data-name="Price">
      <p className="font-['Encode_Sans:SemiBold',sans-serif] font-semibold leading-[1.5] relative shrink-0 text-[#292526] text-[14px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        $162.99
      </p>
      <Review2 />
    </div>
  );
}

function Text4() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0" data-name="Text">
      <Text5 />
      <Price2 />
    </div>
  );
}

function Product6() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[8px] items-start left-[calc(50%+8.5px)] top-[268px]" data-name="Product 2">
      <Image2 />
      <Text4 />
    </div>
  );
}

function Product8() {
  return (
    <div className="-translate-x-1/2 -translate-y-1/2 absolute h-[258px] left-1/2 top-[calc(50%-0.5px)] w-[207px]" data-name="Product 1">
      <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgProduct1} />
    </div>
  );
}

function Heart5() {
  return (
    <div className="absolute bg-[#292526] left-[117px] rounded-[32px] size-[24px] top-[14px]" data-name="heart">
      <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 size-[16px] top-1/2" data-name="Main Icon">
        <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
          <g id="heart">
            <path d={svgPaths.p2c744500} fill="var(--fill-0, #FDFDFD)" id="Vector" />
            <path d="M16 0H0V16H16V0Z" fill="var(--fill-0, #FDFDFD)" id="Vector_2" opacity="0" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Image3() {
  return (
    <div className="h-[217px] overflow-clip relative rounded-[16px] shrink-0 w-[155px]" data-name="Image">
      <Product8 />
      <Heart5 />
    </div>
  );
}

function Text7() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-start leading-[1.5] relative shrink-0 whitespace-nowrap" data-name="Text">
      <p className="font-['Encode_Sans:SemiBold',sans-serif] font-semibold relative shrink-0 text-[#121111] text-[14px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        Modern Light Clothes
      </p>
      <p className="font-['Encode_Sans:Regular',sans-serif] font-normal relative shrink-0 text-[#787676] text-[10px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        T-Shirt
      </p>
    </div>
  );
}

function Review3() {
  return (
    <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="Review">
      <div className="overflow-clip relative shrink-0 size-[18px]" data-name="Default Icon">
        <div className="absolute inset-[6.67%_8.65%_14.35%_8.64%]" data-name="Vector">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14.8878 14.2171">
            <path d={svgPaths.p1a321100} fill="var(--fill-0, #FFD33C)" id="Vector" />
          </svg>
        </div>
      </div>
      <p className="font-['Encode_Sans:Regular',sans-serif] font-normal leading-[1.5] relative shrink-0 text-[#292526] text-[12px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        5.0
      </p>
    </div>
  );
}

function Price3() {
  return (
    <div className="content-stretch flex gap-[24px] items-center relative shrink-0" data-name="Price">
      <p className="font-['Encode_Sans:SemiBold',sans-serif] font-semibold leading-[1.5] relative shrink-0 text-[#292526] text-[14px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        $212.99
      </p>
      <Review3 />
    </div>
  );
}

function Text6() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0" data-name="Text">
      <Text7 />
      <Price3 />
    </div>
  );
}

function Product() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[8px] items-start left-[24px] top-[268px]" data-name="Product 1">
      <Image3 />
      <Text6 />
    </div>
  );
}

function DefaultLinearCategory() {
  return (
    <div className="absolute contents inset-0" data-name="Default/linear/category">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="category">
          <path d={svgPaths.p28ec1980} id="Vector" stroke="var(--stroke-0, #FDFDFD)" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" />
          <path d={svgPaths.p5a2b7f0} id="Vector_2" stroke="var(--stroke-0, #FDFDFD)" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" />
          <path d={svgPaths.p1eae4000} id="Vector_3" stroke="var(--stroke-0, #FDFDFD)" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" />
          <path d={svgPaths.p28f05580} id="Vector_4" stroke="var(--stroke-0, #FDFDFD)" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" />
          <g id="Vector_5" opacity="0" />
        </g>
      </svg>
    </div>
  );
}

function AllItems() {
  return (
    <div className="bg-[#292526] content-stretch flex gap-[4px] items-center px-[12px] py-[8px] relative rounded-[8px] shrink-0" data-name="All Items">
      <div className="relative shrink-0 size-[16px]" data-name="Default Icon">
        <DefaultLinearCategory />
      </div>
      <p className="font-['Encode_Sans:Medium',sans-serif] font-medium leading-[1.5] relative shrink-0 text-[#fdfdfd] text-[12px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        All Items
      </p>
    </div>
  );
}

function DefaultLinearDress() {
  return (
    <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 size-[20px] top-1/2" data-name="default/linear/dress">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="default/linear/dress">
          <path d={svgPaths.p174fc900} fill="var(--fill-0, #292526)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Dress() {
  return (
    <div className="content-stretch flex gap-[4px] items-center px-[12px] py-[8px] relative rounded-[8px] shrink-0" data-name="Dress">
      <div aria-hidden="true" className="absolute border border-[#dfdede] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="relative shrink-0 size-[16px]" data-name="Default Icon">
        <DefaultLinearDress />
      </div>
      <p className="font-['Encode_Sans:Medium',sans-serif] font-medium leading-[1.5] relative shrink-0 text-[#292526] text-[12px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        Dress
      </p>
    </div>
  );
}

function DefaultLinearTshirt() {
  return (
    <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 size-[20px] top-1/2" data-name="Default/linear/tshirt">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Default/linear/tshirt">
          <path d={svgPaths.p2c80fc80} fill="var(--fill-0, #292526)" id="Vector" />
          <path d={svgPaths.p2b902c40} fill="var(--fill-0, #292526)" id="Vector_2" />
        </g>
      </svg>
    </div>
  );
}

function TShirt() {
  return (
    <div className="content-stretch flex gap-[4px] items-center px-[12px] py-[8px] relative rounded-[8px] shrink-0" data-name="T-Shirt">
      <div aria-hidden="true" className="absolute border border-[#dfdede] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="relative shrink-0 size-[16px]" data-name="Default Icon">
        <DefaultLinearTshirt />
      </div>
      <p className="font-['Encode_Sans:Medium',sans-serif] font-medium leading-[1.5] relative shrink-0 text-[#292526] text-[12px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        T-Shirt
      </p>
    </div>
  );
}

function DefaultLinearJeans() {
  return (
    <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 size-[20px] top-1/2" data-name="default/linear/jeans">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="default/linear/jeans">
          <path d={svgPaths.p32c2be80} fill="var(--fill-0, #292526)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Jeans() {
  return (
    <div className="content-stretch flex gap-[4px] items-center px-[12px] py-[8px] relative rounded-[8px] shrink-0" data-name="Jeans">
      <div aria-hidden="true" className="absolute border border-[#dfdede] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="relative shrink-0 size-[16px]" data-name="Default Icon">
        <DefaultLinearJeans />
      </div>
      <p className="font-['Encode_Sans:Medium',sans-serif] font-medium leading-[1.5] relative shrink-0 text-[#292526] text-[12px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        Jeans
      </p>
    </div>
  );
}

function Category() {
  return (
    <div className="absolute content-stretch flex gap-[16px] items-center left-[24px] overflow-clip top-[210px] w-[327px]" data-name="Category">
      <AllItems />
      <Dress />
      <TShirt />
      <Jeans />
    </div>
  );
}

function Search() {
  return (
    <div className="content-stretch flex gap-[8px] items-center px-[16px] py-[14px] relative rounded-[8px] shrink-0 w-[263px]" data-name="Search">
      <div aria-hidden="true" className="absolute border border-[#dfdede] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="relative shrink-0 size-[20px]" data-name="Main Icon">
        <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
          <g id="search-normal">
            <path d={svgPaths.p3bf26f80} fill="var(--fill-0, #CAC9C9)" id="Vector" />
            <path d={svgPaths.p18463100} fill="var(--fill-0, #CAC9C9)" id="Vector_2" />
            <path d="M20 0H0V20H20V0Z" fill="var(--fill-0, #CAC9C9)" id="Vector_3" opacity="0" />
          </g>
        </svg>
      </div>
      <p className="font-['Encode_Sans:Regular',sans-serif] font-normal h-[20px] leading-[1.5] relative shrink-0 text-[#cac9c9] text-[14px] w-[105px]" style={{ fontVariationSettings: "'wdth' 100" }}>{`Search clothes. . . `}</p>
    </div>
  );
}

function VuesaxOutlineSetting() {
  return (
    <div className="absolute contents inset-0" data-name="vuesax/outline/setting-4">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="setting-4">
          <path d={svgPaths.p2e6c0c70} fill="var(--fill-0, #FDFDFD)" id="Vector" />
          <path d={svgPaths.p2241c100} fill="var(--fill-0, #FDFDFD)" id="Vector_2" />
          <path d={svgPaths.p54b5500} fill="var(--fill-0, #FDFDFD)" id="Vector_3" />
          <path d={svgPaths.p12bb5280} fill="var(--fill-0, #FDFDFD)" id="Vector_4" />
          <path d={svgPaths.p24b02300} fill="var(--fill-0, #FDFDFD)" id="Vector_5" />
          <path d={svgPaths.pbd78580} fill="var(--fill-0, #FDFDFD)" id="Vector_6" />
          <path d="M20 0H0V20H20V0Z" fill="var(--fill-0, #FDFDFD)" id="Vector_7" opacity="0" />
        </g>
      </svg>
    </div>
  );
}

function Filter1() {
  return (
    <div className="overflow-clip relative shrink-0 size-[24px]" data-name="Filter">
      <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 size-[20px] top-1/2" data-name="Main Icon">
        <VuesaxOutlineSetting />
      </div>
    </div>
  );
}

function Filter() {
  return (
    <div className="bg-[#292526] content-stretch flex items-center justify-center p-[12px] relative rounded-[8px] shrink-0" data-name="Filter">
      <Filter1 />
    </div>
  );
}

function SearchBar() {
  return (
    <div className="absolute content-stretch flex gap-[16px] items-center left-[24px] top-[130px]" data-name="Search Bar">
      <Search />
      <Filter />
    </div>
  );
}

function Text8() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-start leading-[1.5] relative shrink-0 whitespace-nowrap" data-name="Text">
      <p className="font-['Encode_Sans:Regular',sans-serif] font-normal relative shrink-0 text-[#787676] text-[12px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        Hello, Welcome 👋
      </p>
      <p className="font-['Encode_Sans:Bold',sans-serif] font-bold relative shrink-0 text-[#121111] text-[16px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        Albert Stevano
      </p>
    </div>
  );
}

function Profile() {
  return (
    <div className="relative rounded-[100px] shrink-0 size-[32px]" data-name="Profile">
      <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[100px] size-full" src={imgProfile} />
    </div>
  );
}

function Customer() {
  return (
    <div className="absolute content-stretch flex gap-[180px] items-center left-[24px] top-[68px]" data-name="Customer">
      <Text8 />
      <Profile />
    </div>
  );
}

function Battery() {
  return (
    <div className="absolute contents right-[24.67px] top-[17.33px]" data-name="Battery">
      <div className="absolute h-[11.333px] right-[27px] top-[17.33px] w-[22px]" data-name="Rectangle">
        <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22 11.3333">
          <path d={svgPaths.p7e6b880} id="Rectangle" opacity="0.35" stroke="var(--stroke-0, black)" />
        </svg>
      </div>
      <div className="absolute h-[4px] right-[24.67px] top-[21px] w-[1.328px]" data-name="Combined Shape">
        <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1.32804 4">
          <path d={svgPaths.p32d253c0} fill="var(--fill-0, black)" id="Combined Shape" opacity="0.4" />
        </svg>
      </div>
      <div className="absolute h-[7.333px] right-[29px] top-[19.33px] w-[18px]" data-name="Rectangle">
        <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 7.33333">
          <path d={svgPaths.p3544af00} fill="var(--fill-0, black)" id="Rectangle" />
        </svg>
      </div>
    </div>
  );
}

function RightSide() {
  return (
    <div className="absolute contents right-[24.67px] top-[17.33px]" data-name="Right Side">
      <Battery />
      <div className="absolute h-[10.966px] right-[54.03px] top-[17.33px] w-[15.272px]" data-name="Wifi">
        <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15.2725 10.966">
          <path d={svgPaths.p3d78f640} fill="var(--fill-0, black)" id="Wifi" />
        </svg>
      </div>
      <div className="absolute h-[10.667px] right-[74.33px] top-[17.67px] w-[17px]" data-name="Mobile Signal">
        <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 17 10.667">
          <path d={svgPaths.p26d17600} fill="var(--fill-0, black)" id="Mobile Signal" />
        </svg>
      </div>
    </div>
  );
}

function Time() {
  return (
    <div className="absolute h-[21px] left-[12px] top-[12px] w-[52px]" data-name="Time">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 52 21">
        <g id="Time">
          <g id="9:41">
            <path d={svgPaths.p2b8d6300} fill="var(--fill-0, black)" />
            <path d={svgPaths.p23f4f800} fill="var(--fill-0, black)" />
            <path d={svgPaths.p2c24a7c0} fill="var(--fill-0, black)" />
            <path d={svgPaths.p823e200} fill="var(--fill-0, black)" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function LeftSide() {
  return (
    <div className="absolute contents left-[12px] top-[12px]" data-name="Left Side">
      <Time />
    </div>
  );
}

function VuesaxOutlineHome() {
  return (
    <div className="absolute contents inset-0" data-name="vuesax/outline/home-2">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="home-2">
          <path d={svgPaths.p37a1e000} fill="var(--fill-0, #FDFDFD)" id="Vector" />
          <path d="M0 24L24 24L24 0L0 0L0 24Z" fill="var(--fill-0, #FDFDFD)" id="Vector_2" opacity="0" />
        </g>
      </svg>
    </div>
  );
}

function Home() {
  return (
    <div className="bg-[rgba(255,255,255,0.05)] overflow-clip relative rounded-[100px] shrink-0 size-[40px]" data-name="Home">
      <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 size-[24px] top-1/2" data-name="Main Icon">
        <VuesaxOutlineHome />
      </div>
      <div className="absolute left-[18px] size-[4px] top-[34px]" data-name="Dot">
        <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 4 4">
          <circle cx="2" cy="2" fill="var(--fill-0, white)" id="Dot" r="2" />
        </svg>
      </div>
    </div>
  );
}

function VuesaxLinearShoppingBag() {
  return (
    <div className="absolute contents inset-0" data-name="vuesax/linear/shopping-bag">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="shopping-bag">
          <path d={svgPaths.pd3b2600} id="Vector" stroke="var(--stroke-0, #FDFDFD)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          <path d={svgPaths.p10249fc0} id="Vector_2" stroke="var(--stroke-0, #FDFDFD)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          <path d="M20.41 17.03H8" id="Vector_3" stroke="var(--stroke-0, #FDFDFD)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          <path d="M23.5 0.5V23.5H0.5V0.5H23.5Z" id="Vector_4" opacity="0" stroke="var(--stroke-0, #FDFDFD)" />
        </g>
      </svg>
    </div>
  );
}

function Cart() {
  return (
    <div className="bg-[rgba(255,255,255,0.05)] overflow-clip relative rounded-[100px] shrink-0 size-[40px]" data-name="Cart">
      <div className="-translate-x-1/2 absolute left-1/2 size-[24px] top-[8px]" data-name="Main Icon">
        <VuesaxLinearShoppingBag />
      </div>
      <div className="absolute bg-[#f13658] border-0 border-solid border-white bottom-1/2 left-[55%] right-1/4 rounded-[7.5px] top-[30%]" data-name="Dot" />
    </div>
  );
}

function Favourite() {
  return (
    <div className="bg-[rgba(255,255,255,0.05)] overflow-clip relative rounded-[100px] shrink-0 size-[40px]" data-name="Favourite">
      <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 size-[24px] top-1/2" data-name="Main Icon">
        <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
          <g id="heart">
            <path d={svgPaths.p3504fe00} fill="var(--fill-0, #FDFDFD)" id="Vector" />
            <path d="M24 0H0V24H24V0Z" fill="var(--fill-0, #FDFDFD)" id="Vector_2" opacity="0" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function VuesaxOutlineProfile() {
  return (
    <div className="absolute contents inset-0" data-name="vuesax/outline/profile">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="profile">
          <path d={svgPaths.p11b6c600} id="Vector" stroke="var(--stroke-0, #FDFDFD)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          <path d={svgPaths.p18d86500} id="Vector_2" stroke="var(--stroke-0, #FDFDFD)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          <path d={svgPaths.p1a4bb100} id="Vector_3" opacity="0" stroke="var(--stroke-0, #FDFDFD)" />
        </g>
      </svg>
    </div>
  );
}

function Account() {
  return (
    <div className="bg-[rgba(255,255,255,0.05)] overflow-clip relative rounded-[100px] shrink-0 size-[40px]" data-name="Account">
      <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 size-[24px] top-1/2" data-name="Main Icon">
        <VuesaxOutlineProfile />
      </div>
    </div>
  );
}

function BottomNavigation() {
  return (
    <div className="-translate-x-1/2 absolute bg-[#292526] bottom-[32px] content-stretch flex gap-[45px] items-start left-1/2 px-[16px] py-[10px] rounded-[44px]" data-name="Bottom Navigation">
      <Home />
      <Cart />
      <Favourite />
      <Account />
    </div>
  );
}

export default function HighFidelityHome() {
  return (
    <div className="bg-white relative size-full" data-name="High-Fidelity ( Home )">
      <Product3 />
      <Product2 />
      <div className="absolute bg-white blur-[35px] h-[66px] left-[24px] top-[687px] w-[327px]" data-name="Shadow" />
      <Product6 />
      <Product />
      <Category />
      <SearchBar />
      <Customer />
      <div className="-translate-x-1/2 absolute bg-white bottom-0 h-[59px] left-1/2 w-[375px]" data-name="Iphone">
        <div className="-translate-x-1/2 absolute bg-[#101010] bottom-[8px] h-[5px] left-[calc(50%+0.5px)] rounded-[100px] w-[134px]" data-name="Home Indicator" />
      </div>
      <div className="-translate-x-1/2 absolute h-[44px] left-1/2 overflow-clip top-0 w-[375px]" data-name="Iphone">
        <RightSide />
        <LeftSide />
      </div>
      <BottomNavigation />
    </div>
  );
}