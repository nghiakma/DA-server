import {Schema,model,Document} from "mongoose";


export interface Category extends Document{
    title:string;
}

export interface BannerImage extends Document{
    url: string;
}

interface Layout extends Document{
    type: string;
    categories: Category[];
    banner:{
        image: BannerImage;
        title: string;
        subTitle: string;
    };
}

const categorySchema = new Schema<Category> ({
    title: {type:String},
});

const bannerImageSchema = new Schema<BannerImage> ({
    url: {type:String},
});


const layoutSchema = new Schema<Layout>({
   type:{type:String},
   categories: [categorySchema],
   banner:{
    image: bannerImageSchema,
    title: {type:String},
    subTitle: {type:String},
   },
});

const LayoutModel = model<Layout>('Layout',layoutSchema);

export default LayoutModel;