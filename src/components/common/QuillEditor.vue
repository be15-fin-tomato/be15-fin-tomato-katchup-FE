<script setup>
import { onMounted, watch } from 'vue';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import QuillResize from 'quill-resize-module';

Quill.register('modules/resize', QuillResize);

const props = defineProps({
  content: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['update:content']);

let quill;


onMounted(() => {
  quill = new Quill('#editor', {
    theme: 'snow',
    placeholder: '  내용을 입력하세요.',
    modules: {
      toolbar: {
        container: [
          ['bold', 'italic', 'underline', 'strike'],
          ['link', 'image'], // 'file' 버튼 제거
          [{ list: 'ordered' }, { list: 'bullet' }],
          [{ size: ['small', false, 'large', 'huge'] }],
          [{ color: [] }, { background: [] }],
          [{ font: [] }],
          [{ align: [] }],
        ],
        // 'file' 핸들러도 제거
        handlers: {
          // 'file' 핸들러 없음
        },
      },
      resize: {
        parchment: {
          image: {
            attribute: ['width'],
            limit: {
              minWidth: 200,
              maxWidth: 1000,
              maxHeight: 1000,
            },
          },
        },
      },
    },
  });

  // Quill 에디터 초기화 후 'file' 버튼에 SVG 아이콘 삽입 로직도 제거
  // const fileButton = document.querySelector('.ql-toolbar .ql-file');
  // if (fileButton) {
  //   fileButton.innerHTML = `
  //     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-package">
  //       <path d="m7.5 4.27 9 5.15"/>
  //       <path d="M2.5 8.67 12 14l9.5-5.33L12 3.33z"/>
  //       <path d="M7.5 19.73 12 22.5l4.5-2.77"/>
  //       <path d="M2.5 13.33 12 18.67l9.5-5.34"/>
  //     </svg>
  //   `;
  // }

  quill.root.innerHTML = props.content;

  quill.on('text-change', () => {
    const htmlContent = quill.root.innerHTML;
    console.log('QuillEditor emitting:', htmlContent);
    emit('update:content', htmlContent);
  });
});

watch(
  () => props.content,
  (newValue) => {
    if (quill && quill.root.innerHTML !== newValue) {
      quill.root.innerHTML = newValue;
    }
  }
);
</script>

<template>
  <div class="editor-wrapper ">
    <div id="editor"></div>
  </div>
</template>
