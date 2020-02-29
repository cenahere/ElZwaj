using System.Linq;
using AutoMapper;
using ZwajApp.API.Dtos;
using zwajapp_api.Dtos;
using zwajapp_api.Models;

namespace zwajapp_api.Helpers
{
    public class AutoMapperProfiles : Profile
    {
        public AutoMapperProfiles()
        {
            CreateMap<UserForRegisterDto,User>();
            CreateMap<User,UserForLoginDto>();
            CreateMap<Photo,PhotoForDetailsDto>();

            CreateMap<User,UserForListDto>()
                .ForMember(dest=>dest.PhotoUrl , opt=>{opt.MapFrom(src=>src.Photos.FirstOrDefault(p=>p.IsMain).Url);})
                .ForMember(dest=>dest.Age,opt=>{opt.MapFrom(src=>src.DateOfBirth.CalculateAge());});
            CreateMap<User,UserForDetailsDto>()
                .ForMember(dest=>dest.PhotoUrl , opt=>{opt.MapFrom(src=>src.Photos.FirstOrDefault(p=>p.IsMain).Url);})
                .ForMember(dest=>dest.Age,opt=>{opt.MapFrom(src=>src.DateOfBirth.CalculateAge());});

            CreateMap<UserForUpdateDto,User>();
            CreateMap<Photo,PhotoToReturnDto>();
            CreateMap<PhotoToCreateDto,Photo>();
            
            // تستخدم ال ReverseMap لكي تكون حقول الادخال هي هي حقول الاخراج حالة عدم الاعتماد علي واحد للاخراج
            CreateMap<MessageForCreationDto,Message>().ReverseMap();
            CreateMap<Message,MessageToReturnDto>()
            .ForMember(dest=>dest.SenderPhotoUrl,opt=>{opt.MapFrom(src=>src.Sender.Photos.FirstOrDefault(p=>p.IsMain).Url);})
            .ForMember(dest=>dest.RecipientPhotoUrl,opt=>{opt.MapFrom(src=>src.Recipient.Photos.FirstOrDefault(p=>p.IsMain).Url);});
                    
        }
    }
}