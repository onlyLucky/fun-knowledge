import svgPaths from "./svg-uh5711wp8y";
import imgProduct2 from "./614453ef068eb58d25fd4f9e006121cffd52fcae.png";

function Product() {
  return (
    <div className="-translate-x-1/2 absolute h-[439px] left-1/2 top-0 w-[375px]" data-name="Product 2">
      <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgProduct2} />
    </div>
  );
}

function VuesaxOutlineArrowDown() {
  return (
    <div className="absolute contents inset-0" data-name="vuesax/outline/arrow-down">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="arrow-down">
          <path d={svgPaths.p336ed396} id="Vector" stroke="var(--stroke-0, #292526)" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="1.5" />
          <path d={svgPaths.p1a4bb100} id="Vector_2" opacity="0" stroke="var(--stroke-0, #292526)" />
        </g>
      </svg>
    </div>
  );
}

function Back() {
  return (
    <div className="absolute bg-[#fdfdfd] content-stretch drop-shadow-[0px_4px_6px_rgba(41,37,38,0.1)] flex items-start left-[16px] p-[8px] rounded-[32px] top-[16px]" data-name="Back">
      <div className="flex items-center justify-center relative shrink-0 size-[24px]" style={{ "--transform-inner-width": "300", "--transform-inner-height": "19" } as React.CSSProperties}>
        <div className="flex-none rotate-90">
          <div className="relative size-[24px]" data-name="Main Icon">
            <VuesaxOutlineArrowDown />
          </div>
        </div>
      </div>
    </div>
  );
}

function Heart1() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="heart">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="heart">
          <path d="M0 24L24 24L24 0L0 0L0 24Z" fill="var(--fill-0, #292526)" id="Vector" opacity="0" />
          <path d={svgPaths.p3f458d80} fill="var(--fill-0, #292526)" id="Vector_2" />
        </g>
      </svg>
    </div>
  );
}

function Heart() {
  return (
    <div className="absolute bg-[#fdfdfd] content-stretch flex items-start overflow-clip p-[8px] right-[16px] rounded-[32px] shadow-[0px_4px_12px_0px_rgba(41,37,38,0.1)] top-[16px]" data-name="heart">
      <Heart1 />
    </div>
  );
}

function ImagePreview1() {
  return (
    <div className="absolute h-[392px] left-[24px] overflow-clip rounded-[16px] top-[68px] w-[327px]" data-name="Image Preview">
      <Product />
      <Back />
      <Heart />
    </div>
  );
}

function ImagePreview() {
  return (
    <div className="-translate-x-1/2 absolute h-[484px] left-1/2 overflow-clip top-0 w-[375px]" data-name="Image Preview">
      <ImagePreview1 />
    </div>
  );
}

function VuesaxOutlineShoppingCart() {
  return (
    <div className="absolute contents inset-0" data-name="vuesax/outline/shopping-cart">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="shopping-cart">
          <path d={svgPaths.pdd64680} id="Vector" stroke="var(--stroke-0, #FDFDFD)" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="1.5" />
          <path d={svgPaths.p2b957a00} id="Vector_2" stroke="var(--stroke-0, #FDFDFD)" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="1.5" />
          <path d={svgPaths.pb45e600} id="Vector_3" stroke="var(--stroke-0, #FDFDFD)" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="1.5" />
          <path d="M9 8H21" id="Vector_4" stroke="var(--stroke-0, #FDFDFD)" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="1.5" />
          <path d="M23.5 0.5V23.5H0.5V0.5H23.5Z" id="Vector_5" opacity="0" stroke="var(--stroke-0, #FDFDFD)" />
        </g>
      </svg>
    </div>
  );
}

function Review() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="Review">
      <div className="overflow-clip relative shrink-0 size-[18px]" data-name="Default Icon">
        <div className="absolute inset-[6.67%_8.65%_14.35%_8.64%]" data-name="Vector">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14.8878 14.2171">
            <path d={svgPaths.p1a321100} fill="var(--fill-0, #FFD33C)" id="Vector" />
          </svg>
        </div>
      </div>
      <p className="font-['Encode_Sans:Regular',sans-serif] font-normal leading-[0] relative shrink-0 text-text-muted text-[12px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        <span className="leading-[1.2] text-text-sub">5.0</span>
        <span className="leading-[1.2]">{` `}</span>
        <span className="leading-[1.2] text-[#347efb]">(7.932 reviews)</span>
      </p>
    </div>
  );
}

function Text1() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-start justify-center relative shrink-0" data-name="Text">
      <p className="font-['Encode_Sans:SemiBold',sans-serif] font-semibold h-[32px] leading-[1.3] relative shrink-0 text-text-main text-[24px] w-[195px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        Light Dress Bless
      </p>
      <Review />
    </div>
  );
}

function DefaultLinearMinus() {
  return (
    <div className="absolute contents inset-0" data-name="default/linear/minus">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="minus">
          <path d="M4 8H12" id="Vector" stroke="var(--stroke-0, #292526)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          <g id="Vector_2" opacity="0" />
        </g>
      </svg>
    </div>
  );
}

function Minus() {
  return (
    <div className="relative rounded-[32px] shrink-0 size-[32px]" data-name="Minus">
      <div className="overflow-clip relative rounded-[inherit] size-full">
        <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 size-[16px] top-1/2" data-name="Default Icon">
          <DefaultLinearMinus />
        </div>
      </div>
      <div aria-hidden="true" className="absolute border border-[#dfdede] border-solid inset-0 pointer-events-none rounded-[32px]" />
    </div>
  );
}

function DefaultLinearAdd() {
  return (
    <div className="absolute contents inset-0" data-name="default/linear/add">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="add">
          <path d="M4 8H12" id="Vector" stroke="var(--stroke-0, #292526)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          <path d="M8 12V4" id="Vector_2" stroke="var(--stroke-0, #292526)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          <g id="Vector_3" opacity="0" />
        </g>
      </svg>
    </div>
  );
}

function Add() {
  return (
    <div className="relative rounded-[32px] shrink-0 size-[32px]" data-name="Add">
      <div className="overflow-clip relative rounded-[inherit] size-full">
        <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 size-[16px] top-1/2" data-name="Default Icon">
          <DefaultLinearAdd />
        </div>
      </div>
      <div aria-hidden="true" className="absolute border border-[#dfdede] border-solid inset-0 pointer-events-none rounded-[32px]" />
    </div>
  );
}

function AddItem() {
  return (
    <div className="content-stretch flex gap-[12px] items-center justify-center relative shrink-0" data-name="Add Item">
      <Minus />
      <p className="font-['Encode_Sans:Bold',sans-serif] font-bold leading-[1.2] relative shrink-0 text-primary text-[16px] w-[7px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        1
      </p>
      <Add />
    </div>
  );
}

function Text() {
  return (
    <div className="content-stretch flex gap-[37px] items-center relative shrink-0" data-name="Text">
      <Text1 />
      <AddItem />
    </div>
  );
}

function Detail1() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[16px] items-start left-[24px] top-[24px]" data-name="Detail">
      <Text />
      <div className="font-['Encode_Sans:Regular',sans-serif] font-normal leading-[0] relative shrink-0 text-text-muted text-[0px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[1.5] mb-0 text-text-sub text-[12px]">Its simple and elegant shape makes it perfect for</p>
        <p className="leading-[1.5] mb-0 text-text-sub text-[12px]">those of you who like you who want minimalist</p>
        <p>
          <span className="leading-[1.5] text-text-sub text-[12px]">clothes</span>
          <span className="leading-[1.5] text-[12px]">{` `}</span>
          <span className="font-['Encode_Sans:SemiBold',sans-serif] font-semibold leading-[1.5] text-text-main text-[14px]" style={{ fontVariationSettings: "'wdth' 100" }}>
            Read More. . .
          </span>
        </p>
      </div>
    </div>
  );
}

function SizeS() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center p-[10px] relative rounded-[32px] shrink-0 size-[26px]" data-name="Size s">
      <div aria-hidden="true" className="absolute border border-[#dfdede] border-solid inset-0 pointer-events-none rounded-[32px]" />
      <p className="font-['Encode_Sans:Regular',sans-serif] font-normal leading-[1.5] relative shrink-0 text-primary text-[12px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        S
      </p>
    </div>
  );
}

function SizeM() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center p-[10px] relative rounded-[32px] shrink-0 size-[26px]" data-name="Size m">
      <div aria-hidden="true" className="absolute border border-[#dfdede] border-solid inset-0 pointer-events-none rounded-[32px]" />
      <p className="font-['Encode_Sans:Regular',sans-serif] font-normal leading-[1.5] relative shrink-0 text-primary text-[12px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        M
      </p>
    </div>
  );
}

function SizeL() {
  return (
    <div className="bg-primary content-stretch flex flex-col items-center justify-center p-[10px] relative rounded-[32px] shrink-0 size-[26px]" data-name="Size l">
      <p className="font-['Encode_Sans:Bold',sans-serif] font-bold leading-[1.5] relative shrink-0 text-[#fdfdfd] text-[12px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        L
      </p>
    </div>
  );
}

function SizeXl() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center p-[10px] relative rounded-[32px] shrink-0 size-[26px]" data-name="Size xl">
      <div aria-hidden="true" className="absolute border border-[#dfdede] border-solid inset-0 pointer-events-none rounded-[32px]" />
      <p className="font-['Encode_Sans:Regular',sans-serif] font-normal leading-[1.5] relative shrink-0 text-primary text-[12px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        XL
      </p>
    </div>
  );
}

function Frame() {
  return (
    <div className="content-stretch flex gap-[8px] items-start relative shrink-0">
      <SizeS />
      <SizeM />
      <SizeL />
      <SizeXl />
    </div>
  );
}

function Size() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[8px] items-start justify-center left-[24px] top-[184px]" data-name="Size">
      <p className="font-['Encode_Sans:Bold',sans-serif] font-bold leading-[1.5] relative shrink-0 text-text-main text-[12px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        Choose Size
      </p>
      <Frame />
    </div>
  );
}

function Component() {
  return <div className="bg-text-sub rounded-[100px] shrink-0 size-[26px]" data-name="1" />;
}

function Component1() {
  return (
    <div className="bg-[#433f40] relative rounded-[100px] shrink-0 size-[26px]" data-name="2">
      <div aria-hidden="true" className="absolute border border-[#fdfdfd] border-solid inset-0 pointer-events-none rounded-[100px]" />
    </div>
  );
}

function Component2() {
  return <div className="bg-[#121111] rounded-[100px] shrink-0 size-[26px]" data-name="3" />;
}

function ChooseColor() {
  return (
    <div className="content-stretch flex gap-[8px] items-end relative shrink-0" data-name="Choose Color">
      <Component />
      <Component1 />
      <Component2 />
    </div>
  );
}

function Color() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[8px] items-start justify-center left-[257px] top-[184px]" data-name="Color">
      <p className="font-['Encode_Sans:Bold',sans-serif] font-bold leading-[1.5] relative shrink-0 text-text-main text-[12px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        Color
      </p>
      <ChooseColor />
    </div>
  );
}

function Detail() {
  return (
    <div className="-translate-x-1/2 absolute bg-[#fdfdfd] bottom-0 h-[352px] left-1/2 overflow-clip w-[375px]" data-name="Detail">
      <div className="-translate-x-1/2 absolute bg-primary content-stretch flex gap-[8px] items-center justify-center left-1/2 px-[16px] py-[18px] rounded-[45px] top-[260px] w-[327px]" data-name="Button">
        <div className="relative shrink-0 size-[24px]" data-name="Main Icon">
          <VuesaxOutlineShoppingCart />
        </div>
        <p className="font-['Encode_Sans:Bold',sans-serif] font-bold leading-[0] relative shrink-0 text-[#fdfdfd] text-[0px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
          <span className="leading-[1.4] text-[14px]">Add to Cart | $1</span>
          <span className="leading-[1.4] text-[14px]">62</span>
          <span className="leading-[1.4] text-[14px]">{`.99 `}</span>
          <span className="[text-decoration-skip-ink:none] decoration-solid font-['Encode_Sans:Regular',sans-serif] font-normal leading-[1.4] line-through text-[10px]" style={{ fontVariationSettings: "'wdth' 100" }}>
            $190.99
          </span>
        </p>
      </div>
      <Detail1 />
      <div className="-translate-x-1/2 absolute h-0 left-1/2 top-[168px] w-[327px]" data-name="Strip">
        <div className="absolute inset-[-1px_0_0_0]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 327 1">
            <line id="Stripe" stroke="var(--stroke-0, #F6F6F6)" x2="327" y1="0.5" y2="0.5" />
          </svg>
        </div>
      </div>
      <Size />
      <Color />
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

export default function HighFidelityDetail() {
  return (
    <div className="bg-white relative size-full" data-name="High-Fidelity ( Detail )">
      <ImagePreview />
      <Detail />
      <div className="-translate-x-1/2 absolute bottom-0 h-[59px] left-1/2 w-[375px]" data-name="Iphone">
        <div className="-translate-x-1/2 absolute bg-[#101010] bottom-[8px] h-[5px] left-[calc(50%+0.5px)] rounded-[100px] w-[134px]" data-name="Home Indicator" />
      </div>
      <div className="-translate-x-1/2 absolute h-[44px] left-1/2 overflow-clip top-0 w-[375px]" data-name="Iphone">
        <RightSide />
        <LeftSide />
      </div>
    </div>
  );
}