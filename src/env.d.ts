interface ImportMetaEnv {
    readonly VITE_APP_BASE_URL: string;
    readonly VITE_APP_BASE_NAME: string;
}

declare module "*.vue" {
    import type { DefineComponent} from "vue";
    const component: DefineComponent<{}, {}, any>
    export  default component
}